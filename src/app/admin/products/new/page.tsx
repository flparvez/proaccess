"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Save, LayoutGrid, Loader2, Plus, X, UploadCloud, 
  Tag, DollarSign, Lock, Link as LinkIcon, Layers, Clock, Trash2, 
  Wand2, Sparkles 
} from "lucide-react";

// --- Components ---
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

// --- Interfaces ---
interface ICategory { _id: string; name: string; }
interface IVariant { name: string; validity: string; price: number; }

export default function CreateProduct() {
  const router = useRouter();

  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  
  // Smart States for Automation
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [highlightDigital, setHighlightDigital] = useState(false);

  // Form Fields
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

  // Load Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (e) {
        toast.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  // ⚡ Automation: Watch Delivery Type to Highlight Section
  useEffect(() => {
    if (["Download Link", "Credentials", "License Key"].includes(formData.fileType)) {
      setHighlightDigital(true);
      const timer = setTimeout(() => setHighlightDigital(false), 2000); // Glow for 2s
      return () => clearTimeout(timer);
    }
  }, [formData.fileType]);

  // --- Handlers ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // ⚡ Automation: Auto-Slug (Only if not manually edited)
      if (name === "title" && !slugManuallyEdited) {
        newData.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }
      return newData;
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setFormData(prev => ({ ...prev, slug: e.target.value }));
  };

  const regenerateSlug = () => {
    const newSlug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    setFormData(prev => ({ ...prev, slug: newSlug }));
    setSlugManuallyEdited(false);
    toast.info("Slug regenerated from title");
  };

  const handleDescriptionChange = (html: string) => {
    setFormData(prev => ({ ...prev, description: html }));
  };

  const handleImagePick = useCallback(async (): Promise<string | null> => {
    const url = prompt("Enter image URL");
    return url ? url : null;
  }, []);

  // Features
  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };
  const addFeature = () => setFeatures([...features, ""]);
  const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));

  // Tags
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

  // ⚡ Variants Logic
  const addVariant = () => setVariants([...variants, { name: "", validity: "", price: 0 }]);
  const updateVariant = (index: number, field: keyof IVariant, value: any) => {
    const newVariants = [...variants];
    // @ts-ignore
    newVariants[index][field] = value;
    setVariants(newVariants);
  };
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));

  // Submit
  const handleSubmit = async () => {
    if (!formData.title) return toast.error("Product Title is required");
    if (!formData.regularPrice) return toast.error("Regular Price is required");
    if (!formData.salePrice) return toast.error("Sale Price is required");
    if (!formData.categoryId) return toast.error("Please select a Category");
    if (!thumbnail) return toast.error("Main Thumbnail is required");

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

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product");

      toast.success("✅ Product Created Successfully!");
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-primary w-10 h-10"/>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="w-full pb-20 max-w-7xl mx-auto px-0 sm:px-6"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b -mx-6 px-2 py-4 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Create Product</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Add a new digital item to your inventory</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()} className="hidden sm:flex">Discard</Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 text-white hover:bg-blue-700 min-w-[140px] shadow-md transition-all active:scale-95">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
            Save Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* === LEFT COLUMN (8 cols) === */}
        <div className="lg:col-span-8 space-y-8">
          
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <LayoutGrid className="w-5 h-5 text-blue-500"/> Core Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Product Title <span className="text-red-500">*</span></Label>
                <Input 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="e.g. Ultimate Digital Marketing Course" 
                  className="h-12 text-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Slug (URL Path)</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center relative">
                      <span className="absolute left-3 text-muted-foreground text-sm">/product/</span>
                      <Input 
                        name="slug" 
                        value={formData.slug} 
                        onChange={handleSlugChange} 
                        className="pl-[4.5rem]"
                      />
                    </div>
                    {/* ⚡ Auto-Gen Slug Button */}
                    <Button variant="outline" size="icon" onClick={regenerateSlug} title="Regenerate Slug from Title">
                      <Wand2 className="w-4 h-4 text-purple-500" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Delivery Type</Label>
                  <Select 
                    value={formData.fileType} 
                    onValueChange={(v) => setFormData(prev => ({...prev, fileType: v}))}
                  >
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
                <Label>Short Description (SEO)</Label>
                <Textarea 
                  name="shortDescription" 
                  value={formData.shortDescription} 
                  onChange={handleChange} 
                  placeholder="Brief summary for the product card..."
                  className="resize-none h-24"
                />
              </div>

              <div className="space-y-2">
                <Label>Detailed Description</Label>
                <div className="border rounded-md overflow-hidden min-h-[300px]">
                  <RichTextEditor 
                    value={formData.description} 
                    onChange={handleDescriptionChange} 
                    onPickImage={handleImagePick}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ⚡ VARIANT MANAGER (VIP Section) */}
          <Card className="border-blue-100 bg-blue-50/10 shadow-sm overflow-hidden">
            <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                  <Layers className="w-5 h-5 text-blue-600"/> VIP / Product Variants
                </CardTitle>
                <Button size="sm" variant="outline" onClick={addVariant} className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50">
                   <Plus className="w-4 h-4 mr-1"/> Add Plan
                </Button>
              </div>
              <CardDescription className="text-blue-700/70">
                Offer multiple tiers (e.g. Silver, Gold) with specific prices & validity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <AnimatePresence>
                {variants.length === 0 && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center py-6 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30">
                    <Layers className="w-10 h-10 text-blue-300 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No variants added.</p>
                    <p className="text-xs text-muted-foreground mt-1">The product will use the standard <b>Sale Price</b> by default.</p>
                  </motion.div>
                )}
                
                {variants.map((variant, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col md:flex-row gap-3 items-end border p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow relative group"
                  >
                    <div className="space-y-1 flex-1 w-full">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase">Plan Name</Label>
                      <Input 
                        placeholder="e.g. Gold Plan" 
                        value={variant.name} 
                        onChange={(e) => updateVariant(index, "name", e.target.value)} 
                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-1 flex-1 w-full">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase">Validity</Label>
                      <div className="relative">
                        <Clock className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                        <Input 
                          placeholder="e.g. 1 Year" 
                          value={variant.validity} 
                          onChange={(e) => updateVariant(index, "validity", e.target.value)} 
                          className="pl-9 bg-gray-50 border-gray-200 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 w-full md:w-32">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase">Price (৳)</Label>
                      <Input 
                        type="number" 
                        value={variant.price} 
                        onChange={(e) => updateVariant(index, "price", Number(e.target.value))} 
                        className="font-mono font-bold text-blue-700 bg-blue-50/50 border-blue-200"
                      />
                    </div>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeVariant(index)} 
                      className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* ✅ DIGITAL DELIVERY CARD (Smart Highlight) */}
          <motion.div animate={highlightDigital ? { scale: 1.02, boxShadow: "0 0 20px rgba(34, 197, 94, 0.3)" } : { scale: 1 }}>
            <Card className={`transition-colors duration-500 ${highlightDigital ? "border-green-400 bg-green-50/40" : "border-green-200 bg-green-50/10"} shadow-sm`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                  <Lock className="w-5 h-5"/> Digital Access
                </CardTitle>
                <CardDescription>
                  Auto-delivered to customer via email/dashboard after purchase.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Secure Link (Drive/Telegram)</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      name="accessLink" 
                      value={formData.accessLink} 
                      onChange={handleChange} 
                      placeholder="https://..." 
                      className="pl-9 bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Access Note / Credentials</Label>
                  <Textarea 
                    name="accessNote" 
                    value={formData.accessNote} 
                    onChange={handleChange} 
                    placeholder="Username: admin..."
                    className="resize-none h-24 bg-white font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Media */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><UploadCloud className="w-5 h-5 text-blue-500"/> Media</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Thumbnail <span className="text-red-500">*</span></Label>
                <div className="p-1 border rounded-xl bg-muted/20 border-dashed border-2">
                  <FileUpload 
                    initialImages={thumbnail ? [thumbnail] : []}
                    onChange={(urls) => setThumbnail(urls[0] || "")} 
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <Label>Gallery</Label>
                <FileUpload 
                  initialImages={gallery}
                  onChange={(urls) => setGallery(urls)} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader><CardTitle className="text-lg">Features List</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-3 items-center group">
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-500 text-xs font-mono">{index + 1}</div>
                  <Input 
                    value={feature} 
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="e.g. Lifetime Access"
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeFeature(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="secondary" size="sm" onClick={addFeature}>
                <Plus className="w-4 h-4 mr-1"/> Add Feature
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* === RIGHT COLUMN (4 cols) === */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Org */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader><CardTitle className="text-lg">Organization</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5"><Label>Available</Label></div>
                  <Switch checked={formData.isAvailable} onCheckedChange={(c) => setFormData(prev => ({...prev, isAvailable: c}))} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5"><Label>Featured</Label></div>
                  <Switch checked={formData.isFeatured} onCheckedChange={(c) => setFormData(prev => ({...prev, isFeatured: c}))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.categoryId} onValueChange={(v) => setFormData(prev => ({...prev, categoryId: v}))}>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pricing (Auto Calculated) */}
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4"><CardTitle className="flex items-center gap-2 text-lg"><DollarSign className="w-5 h-5"/> Pricing</CardTitle></CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label>Regular Price (MRP)</Label>
                <Input name="regularPrice" type="number" value={formData.regularPrice} onChange={handleChange} className="pl-4" />
              </div>
              <div className="space-y-2">
                <Label>Sale Price (Selling)</Label>
                <Input name="salePrice" type="number" value={formData.salePrice} onChange={handleChange} className="pl-4 font-bold text-green-700 bg-green-50/20" />
              </div>
              {/* ⚡ Auto Discount Badge */}
              <AnimatePresence>
                {discountPercent > 0 && (
                  <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="rounded-md bg-green-100 border border-green-200 p-3 flex justify-between items-center">
                    <div className="flex gap-2 items-center text-sm font-medium text-green-800"><Sparkles className="w-4 h-4 text-green-600" /> You Save</div>
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-sm px-2 py-0.5">{discountPercent}% OFF</Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader><CardTitle className="text-lg">Tags</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] border p-2 rounded-lg bg-background focus-within:ring-2 focus-within:ring-ring ring-offset-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1 gap-1 text-xs">
                    {tag} <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeTag(tag)}/>
                  </Badge>
                ))}
                <input 
                  className="flex-1 bg-transparent border-none outline-none text-sm min-w-[80px] h-6" 
                  placeholder={tags.length===0?"Type & Enter...":""} 
                  value={tagInput} 
                  onChange={(e) => setTagInput(e.target.value)} 
                  onKeyDown={handleTagKeyDown} 
                />
              </div>
              <p className="text-xs text-muted-foreground">Press Enter or Comma to add</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}