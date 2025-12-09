"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Save, 
  LayoutGrid, 
  Loader2, 
  Plus, 
  X, 
  UploadCloud, 
  Tag, 
  DollarSign, 
  Info,
  Lock,
  Link as LinkIcon
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

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // 1. States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  
  // Complex Fields
  const [thumbnail, setThumbnail] = useState<string>("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([""]); 
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

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
    // ✅ NEW FIELDS
    accessLink: "",
    accessNote: ""
  });

  const regPrice = Number(formData.regularPrice) || 0;
  const salePrice = Number(formData.salePrice) || 0;
  const discountPercent = regPrice > salePrice 
    ? Math.round(((regPrice - salePrice) / regPrice) * 100) 
    : 0;

  // --- Fetch Data ---
  useEffect(() => {
    const initData = async () => {
      try {
        const catRes = await fetch("/api/categories",{
          cache:"force-cache",next : {
            revalidate: 60
          }
        });
        const catData = await catRes.json();
        setCategories(catData.categories || []);

        const prodRes = await fetch(`/api/products/${id}`);
        const prodJson = await prodRes.json();
        
        if (!prodRes.ok) throw new Error("Product not found");

        const product = prodJson.product;

        setFormData({
            title: product.title,
            slug: product.slug,
            shortDescription: product.shortDescription || "",
            description: product.description || "",
            regularPrice: String(product.regularPrice),
            salePrice: String(product.salePrice),
            categoryId: typeof product.category === 'object' ? product.category._id : product.category,
            fileType: product.fileType || "Credentials",
            isAvailable: product.isAvailable,
            isFeatured: product.isFeatured,
            // ✅ POPULATE HIDDEN FIELDS
            accessLink: product.accessLink || "",
            accessNote: product.accessNote || ""
        });
        
        setThumbnail(product.thumbnail || "");
        setGallery(product.gallery || []);
        setFeatures(product.features && product.features.length > 0 ? product.features : [""]);
        setTags(product.tags || []);

      } catch (e) {
        toast.error("Failed to load product");
        router.push("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    if (id) initData();
  }, [id, router]);

  // --- Handlers (Standard) ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        // ✅ Include new fields
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

      toast.success("✅ Product Updated Successfully!");
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
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
      className="w-full pb-20 max-w-7xl mx-auto px-4 sm:px-6"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b -mx-6 px-6 py-4 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Edit Product</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Updating: {formData.title}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()} className="hidden sm:flex">Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-primary text-primary-foreground min-w-[130px] shadow-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
            Update Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* === LEFT COLUMN === */}
        <div className="lg:col-span-8 space-y-8">
          
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <LayoutGrid className="w-5 h-5 text-muted-foreground"/> General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Product Title</Label>
                <Input name="title" value={formData.title} onChange={handleChange} className="h-12 text-lg font-medium" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input name="slug" value={formData.slug} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Delivery Type</Label>
                  <Select value={formData.fileType} onValueChange={(v) => setFormData(prev => ({...prev, fileType: v}))}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credentials">Account Credentials</SelectItem>
                      <SelectItem value="License Key">License Key</SelectItem>
                      <SelectItem value="Download Link">Download Link</SelectItem>
                      <SelectItem value="File">Zip/PDF File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} className="resize-none h-24" />
              </div>
              <div className="space-y-2">
                <Label>Detailed Description</Label>
                <div className="border rounded-md overflow-hidden min-h-[300px]">
                  <RichTextEditor value={formData.description} onChange={handleDescriptionChange} onPickImage={handleImagePick} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ✅ DIGITAL DELIVERY CARD (NEW) */}
          <Card className="border-green-200 bg-green-50/30 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                <Lock className="w-5 h-5"/> Digital Delivery
              </CardTitle>
              <CardDescription>
                This content will be automatically delivered to the user after payment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Resource Link / Download URL</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    name="accessLink" 
                    value={formData.accessLink} 
                    onChange={handleChange} 
                    placeholder="e.g. https://drive.google.com/..." 
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
                  placeholder="e.g. Password: 1234 or Join this Telegram Channel..."
                  className="resize-none h-24 bg-white"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><UploadCloud className="w-5 h-5 text-muted-foreground"/> Media Assets</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Thumbnail Image</Label>
                <div className="p-1 border rounded-xl bg-muted/20">
                  <FileUpload initialImages={thumbnail ? [thumbnail] : []} onChange={(urls) => setThumbnail(urls[0] || "")} />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <Label>Gallery Images</Label>
                <FileUpload initialImages={gallery} onChange={(urls) => setGallery(urls)} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader><CardTitle className="text-lg">Product Features</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-3 items-center group">
                  <Input value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)} className="flex-1" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)} className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="secondary" size="sm" onClick={addFeature}><Plus className="w-4 h-4 mr-1"/> Add Feature</Button>
            </CardContent>
          </Card>
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="lg:col-span-4 space-y-8">
          {/* ... (Same Right Column: Org, Pricing, Tags) ... */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader><CardTitle className="text-lg">Organization</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Available</Label></div><Switch checked={formData.isAvailable} onCheckedChange={(c) => setFormData(prev => ({...prev, isAvailable: c}))} /></div>
                <Separator />
                <div className="flex items-center justify-between"><div className="space-y-0.5"><Label>Featured</Label></div><Switch checked={formData.isFeatured} onCheckedChange={(c) => setFormData(prev => ({...prev, isFeatured: c}))} /></div>
              </div>
              <div className="space-y-2"><Label>Category</Label><Select value={formData.categoryId} onValueChange={(v) => setFormData(prev => ({...prev, categoryId: v}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{categories.map(cat => <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>)}</SelectContent></Select></div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4"><CardTitle className="flex items-center gap-2 text-lg"><DollarSign className="w-5 h-5"/> Pricing</CardTitle></CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2"><Label>Regular Price (MRP)</Label><Input name="regularPrice" type="number" value={formData.regularPrice} onChange={handleChange} className="pl-4" /></div>
              <div className="space-y-2"><Label>Sale Price (Selling)</Label><Input name="salePrice" type="number" value={formData.salePrice} onChange={handleChange} className="pl-4 font-bold text-green-700 bg-green-50/20" /></div>
              {discountPercent > 0 && (<div className="rounded-md bg-green-100 border border-green-200 p-3 flex justify-between items-center"><div className="flex gap-2 items-center text-sm font-medium text-green-800"><Tag className="w-4 h-4" /> Discount</div><Badge variant="default" className="bg-green-600">{discountPercent}% OFF</Badge></div>)}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader><CardTitle className="text-lg">Tags</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] border p-2 rounded-lg bg-background">
                {tags.map(tag => (<Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1 gap-1 text-xs">{tag} <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeTag(tag)}/></Badge>))}
                <input className="flex-1 bg-transparent border-none outline-none text-sm min-w-[80px] h-6" placeholder={tags.length===0?"Type & Enter...":""} value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}