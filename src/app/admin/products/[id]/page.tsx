"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Save, LayoutGrid, Loader2, Plus, X, UploadCloud, 
  Tag, DollarSign, Lock, Link as LinkIcon, Layers, Clock, Trash2, 
  Wand2, Sparkles 
} from "lucide-react";

// Components
import FileUpload from "@/components/Fileupload"; 
import RichTextEditor from "@/components/RichTextEditor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface ICategory { _id: string; name: string; }

// ⚡ Variant Interface
interface IVariant {
  name: string;      
  validity: string; 
  price: number;    
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // 1. States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  
  // Smart States
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [highlightDigital, setHighlightDigital] = useState(false);

  // Complex Fields
  const [thumbnail, setThumbnail] = useState<string>("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([""]); 
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [variants, setVariants] = useState<IVariant[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    regularPrice: "",
    salePrice: "",
    categoryId: "",
    fileType: "Credentials",
    isAvailable: true,
    isFeatured: false,
    accessLink: "",
    accessNote: ""
  });

  // ⚡ Automation: Discount Calculator
  const regPrice = Number(formData.regularPrice) || 0;
  const salePrice = Number(formData.salePrice) || 0;
  const discountPercent = regPrice > salePrice 
    ? Math.round(((regPrice - salePrice) / regPrice) * 100) 
    : 0;

  // --- Fetch Data ---
  useEffect(() => {
    const initData = async () => {
      try {
        const catRes = await fetch("/api/categories", { cache: "force-cache", next: { revalidate: 60 } });
        const catData = await catRes.json();
        setCategories(catData.categories || []);

        const prodRes = await fetch(`/api/products/${id}`);
        const prodJson = await prodRes.json();
        
        if (!prodRes.ok || !prodJson.product) throw new Error("Product not found");

        const product = prodJson.product;

        // 🛡️ Safe Category Handling (Prevents 'null' error if category was deleted)
        const safeCategoryId = (product.category && typeof product.category === 'object') 
            ? product.category._id 
            : (product.category || "");

        setFormData({
            title: product.title || "",
            slug: product.slug || "",
            shortDescription: product.shortDescription || "",
            description: product.description || "",
            regularPrice: String(product.regularPrice || 0),
            salePrice: String(product.salePrice || 0),
            categoryId: safeCategoryId,
            fileType: product.fileType || "Credentials",
            isAvailable: product.isAvailable ?? true,
            isFeatured: product.isFeatured ?? false,
            accessLink: product.accessLink || "",
            accessNote: product.accessNote || ""
        });
        
        setThumbnail(product.thumbnail || "");
        setGallery(product.gallery || []);
        setFeatures(product.features && product.features.length > 0 ? product.features : [""]);
        setTags(product.tags || []);

        // ⚡ Populate Variants
        if (Array.isArray(product.variants)) {
          setVariants(product.variants);
        }

      } catch (e) {
        toast.error("Failed to load product data");
      } finally {
        setLoading(false);
      }
    };

    if (id) initData();
  }, [id]);

  // ⚡ Automation: Watch Delivery Type to Highlight Section
  useEffect(() => {
    if (["Download Link", "Credentials", "License Key"].includes(formData.fileType)) {
      setHighlightDigital(true);
      const timer = setTimeout(() => setHighlightDigital(false), 2500); // Glow for 2.5s
      return () => clearTimeout(timer);
    }
  }, [formData.fileType]);

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ⚡ Automation: Slug Logic
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setFormData(prev => ({ ...prev, slug: e.target.value }));
  };

  const regenerateSlug = () => {
    const newSlug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    setFormData(prev => ({ ...prev, slug: newSlug }));
    setSlugManuallyEdited(false);
    toast.info("Slug regenerated from title!");
  };

  const handleDescriptionChange = (html: string) => {
    setFormData(prev => ({ ...prev, description: html }));
  };

  const handleImagePick = useCallback(async (): Promise<string | null> => {
    const url = prompt("Enter image URL");
    return url ? url : null;
  }, []);

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };
  const addFeature = () => setFeatures([...features, ""]);
  const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput("");
      }
    }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };
  const removeTag = (t: string) => setTags(tags.filter(tag => tag !== t));

  // ⚡ Variant Handlers
  const addVariant = () => setVariants([...variants, { name: "", validity: "", price: 0 }]);
  const updateVariant = (index: number, field: keyof IVariant, value: any) => {
    const newVariants = [...variants];
    // @ts-ignore
    newVariants[index][field] = value;
    setVariants(newVariants);
  };
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));

  // --- Submit ---
  const handleSubmit = async () => {
    if (!formData.title) return toast.error("Title required");
    
    setSaving(true);
    try {
      const payload = {
        ...formData,
        regularPrice: Number(formData.regularPrice),
        salePrice: Number(formData.salePrice),
        thumbnail,
        gallery,
        tags,
        features: features.filter(f => f.trim() !== ""),
        category: formData.categoryId, 
        variants: variants.filter(v => v.name && v.validity),
        accessLink: formData.accessLink,
        accessNote: formData.accessNote
      };

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      toast.success("✅ Product Saved!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-primary w-12 h-12"/>
      <p className="text-muted-foreground animate-pulse">Loading Product Data...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="w-full pb-24 max-w-7xl mx-auto px-2 sm:px-6" // ✅ Responsive Padding (px-2 mobile)
    >
      
      {/* 🟢 Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b -mx-2 sm:-mx-6 px-4 sm:px-6 py-4 mb-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">Edit Product</h1>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
               <span className={formData.isAvailable ? "text-green-600 font-medium" : "text-red-500"}>
                 {formData.isAvailable ? "● Live" : "● Draft"}
               </span>
               <span className="hidden sm:inline">|</span>
               <span className="hidden sm:inline truncate max-w-[100px]">{id}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => router.back()} className="hidden sm:flex">Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px] shadow-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
            Save
          </Button>
        </div>
      </div>

      

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* === LEFT COLUMN === */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* General Info */}
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><LayoutGrid className="w-5 h-5 text-blue-500"/> Core Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Product Title</Label>
                <Input name="title" value={formData.title} onChange={handleChange} className="text-base sm:text-lg font-medium h-11" placeholder="Ex: Advanced React Course" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center relative">
                      <span className="absolute left-3 text-muted-foreground text-sm">/</span>
                      <Input name="slug" value={formData.slug} onChange={handleSlugChange} className="pl-6" />
                    </div>
                    {/* ⚡ Auto-Gen Slug Button */}
                    <Button variant="outline" size="icon" onClick={regenerateSlug} title="Regenerate Slug from Title">
                      <Wand2 className="w-4 h-4 text-purple-500" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Delivery Method</Label>
                  <Select value={formData.fileType} onValueChange={(v) => setFormData(prev => ({...prev, fileType: v}))}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credentials">🔐 Credentials</SelectItem>
                      <SelectItem value="License Key">🔑 License Key</SelectItem>
                      <SelectItem value="Download Link">⬇️ Download Link</SelectItem>
                      <SelectItem value="File">📂 File Upload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} className="h-20 resize-none" />
              </div>
              <div className="space-y-2">
                <Label>Full Description</Label>
                <div className="border rounded-lg overflow-hidden min-h-[300px]">
                  <RichTextEditor value={formData.description} onChange={handleDescriptionChange} onPickImage={handleImagePick} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ⚡ VARIANTS MANAGER */}
          <Card className="border-blue-100 bg-blue-50/10 shadow-sm overflow-hidden">
            <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-blue-900">
                  <Layers className="w-5 h-5 text-blue-600"/> VIP / Variants
                </CardTitle>
                <Button size="sm" variant="outline" onClick={addVariant} className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 h-8">
                   <Plus className="w-4 h-4 mr-1"/> Add Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-5">
              <AnimatePresence>
                {variants.length === 0 && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center py-4 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30">
                    <p className="text-sm text-muted-foreground">No variants added.</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Using standard Sale Price.</p>
                  </motion.div>
                )}
                
                {variants.map((variant, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col sm:flex-row gap-3 items-end border p-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow relative group"
                  >
                    <div className="space-y-1 flex-1 w-full">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Plan Name</Label>
                      <Input placeholder="e.g. Gold Plan" value={variant.name} onChange={(e) => updateVariant(index, "name", e.target.value)} className="h-9" />
                    </div>
                    
                    <div className="space-y-1 flex-1 w-full">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Validity</Label>
                      <div className="relative">
                        <Clock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                        <Input placeholder="e.g. 1 Year" value={variant.validity} onChange={(e) => updateVariant(index, "validity", e.target.value)} className="pl-9 h-9" />
                      </div>
                    </div>

                    <div className="space-y-1 w-full sm:w-32">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Price (৳)</Label>
                      <Input type="number" value={variant.price} onChange={(e) => updateVariant(index, "price", Number(e.target.value))} className="font-mono font-bold text-blue-700 bg-blue-50/50 border-blue-200 h-9" />
                    </div>

                    <Button variant="ghost" size="icon" onClick={() => removeVariant(index)} className="h-9 w-9 text-muted-foreground hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* ✅ DIGITAL DELIVERY (Smart Highlight) */}
          <motion.div animate={highlightDigital ? { scale: 1.01, boxShadow: "0 0 15px rgba(34, 197, 94, 0.25)" } : { scale: 1 }}>
            <Card className={`transition-colors duration-500 ${highlightDigital ? "border-green-400 bg-green-50/30" : "border-green-200 bg-green-50/10"} shadow-sm`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-green-800">
                  <Lock className="w-5 h-5"/> Digital Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Secure Link</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input name="accessLink" value={formData.accessLink} onChange={handleChange} placeholder="https://drive..." className="pl-9 bg-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Access Note</Label>
                  <Textarea name="accessNote" value={formData.accessNote} onChange={handleChange} placeholder="Credentials..." className="resize-none h-20 bg-white font-mono text-sm" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Media */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base sm:text-lg"><UploadCloud className="w-5 h-5 text-blue-500"/> Media</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Thumbnail <span className="text-red-500">*</span></Label>
                <div className="p-1 border rounded-xl bg-slate-50 border-dashed border-2">
                  <FileUpload initialImages={thumbnail ? [thumbnail] : []} onChange={(urls) => setThumbnail(urls[0] || "")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Gallery</Label>
                <FileUpload initialImages={gallery} onChange={(urls) => setGallery(urls)} />
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader><CardTitle className="text-base sm:text-lg">Features List</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2 items-center group">
                  <div className="bg-slate-100 px-2 py-1.5 rounded text-slate-500 text-xs font-mono">{index + 1}</div>
                  <Input value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)} className="flex-1 h-9" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)} className="h-9 w-9 text-muted-foreground hover:text-red-500">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="secondary" size="sm" onClick={addFeature} className="mt-2"><Plus className="w-4 h-4 mr-1"/> Add Feature</Button>
            </CardContent>
          </Card>
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Org */}
          <Card>
            <CardHeader><CardTitle className="text-base sm:text-lg">Organization</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="space-y-0.5"><Label className="text-base">Available</Label></div>
                <Switch checked={formData.isAvailable} onCheckedChange={(c) => setFormData(prev => ({...prev, isAvailable: c}))} />
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <div className="space-y-0.5"><Label className="text-base">Featured</Label></div>
                <Switch checked={formData.isFeatured} onCheckedChange={(c) => setFormData(prev => ({...prev, isFeatured: c}))} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.categoryId} onValueChange={(v) => setFormData(prev => ({...prev, categoryId: v}))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pricing (Auto Calculated) */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-slate-50 border-b pb-3"><CardTitle className="flex items-center gap-2 text-base sm:text-lg"><DollarSign className="w-5 h-5"/> Pricing</CardTitle></CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="space-y-2">
                <Label>Regular Price (MRP)</Label>
                <Input name="regularPrice" type="number" value={formData.regularPrice} onChange={handleChange} className="pl-4" />
              </div>
              <div className="space-y-2">
                <Label>Sale Price (Selling)</Label>
                <Input name="salePrice" type="number" value={formData.salePrice} onChange={handleChange} className="pl-4 font-bold text-green-700 bg-green-50/20 border-green-200" />
              </div>
              {/* ⚡ Auto Discount Badge */}
              <AnimatePresence>
                {discountPercent > 0 && (
                  <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="rounded-lg bg-green-50 border border-green-200 p-3 flex justify-between items-center">
                    <div className="flex gap-2 items-center text-sm font-medium text-green-800"><Sparkles className="w-4 h-4 text-green-600" /> You Save</div>
                    <Badge className="bg-green-600 hover:bg-green-700 text-xs px-2">{discountPercent}% OFF</Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader><CardTitle className="text-base sm:text-lg">Tags</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] border p-2 rounded-lg bg-white focus-within:ring-2 focus-within:ring-ring ring-offset-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1 gap-1 text-xs">
                    {tag} <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeTag(tag)}/>
                  </Badge>
                ))}
                <input 
                  className="flex-1 bg-transparent border-none outline-none text-sm min-w-[60px] h-6" 
                  placeholder={tags.length===0?"Type & Enter...":""} 
                  value={tagInput} 
                  onChange={(e) => setTagInput(e.target.value)} 
                  onKeyDown={handleTagKeyDown} 
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Press Enter to add tags</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}