"use client";

import { useEffect, useState, useCallback } from "react";
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
  Info
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
interface ICategory { 
  _id: string; 
  name: string; 
}

export default function CreateProduct() {
  const router = useRouter();

  // 1. Loading States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 2. Data Lists
  const [categories, setCategories] = useState<ICategory[]>([]);
  
  // 3. Complex Form States
  const [thumbnail, setThumbnail] = useState<string>("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([""]); 
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // 4. Basic Form Data
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
  });

  // 5. Calculations
  const regPrice = Number(formData.regularPrice) || 0;
  const salePrice = Number(formData.salePrice) || 0;
  const discountPercent = regPrice > salePrice 
    ? Math.round(((regPrice - salePrice) / regPrice) * 100) 
    : 0;

  // --- Initialization ---
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

  // --- Handlers ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-Slug Logic
      if (name === "title" && !prev.slug) {
        newData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      }
      return newData;
    });
  };

  const handleDescriptionChange = (html: string) => {
    setFormData(prev => ({ ...prev, description: html }));
  };

  // Simple prompt for image picker in RichText (can be upgraded to modal later)
  const handleImagePick = useCallback(async (): Promise<string | null> => {
    const url = prompt("Enter image URL");
    return url ? url : null;
  }, []);
  // Feature Logic
  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };
  const addFeature = () => setFeatures([...features, ""]);
  const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));

  // Tag Logic
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput("");
      }
    }
    // UX: Remove last tag on backspace if input empty
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };
  const removeTag = (t: string) => setTags(tags.filter(tag => tag !== t));

  // --- Submit Logic ---
  const handleSubmit = async () => {
    // Validation
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
      className="w-full pb-20 max-w-7xl mx-auto px-4 sm:px-6"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b -mx-6 px-6 py-4 mb-8 flex items-center justify-between">
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
          <Button onClick={handleSubmit} disabled={saving} className="bg-primary text-primary-foreground min-w-[130px] shadow-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
            Save Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* === LEFT COLUMN (8 cols) === */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. General Info */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <LayoutGrid className="w-5 h-5 text-muted-foreground"/> General Information
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
                  <div className="flex items-center">
                    <span className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-sm text-muted-foreground">/product/</span>
                    <Input 
                      name="slug" 
                      value={formData.slug} 
                      onChange={handleChange} 
                      className="rounded-l-none"
                    />
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
                      <SelectItem value="Credentials">Account Credentials</SelectItem>
                      <SelectItem value="License Key">License Key</SelectItem>
                      <SelectItem value="Download Link">Download Link</SelectItem>
                      <SelectItem value="File">Zip/PDF File</SelectItem>
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
                  placeholder="Brief summary for the product card and search results..."
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

          {/* 2. Media Upload */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UploadCloud className="w-5 h-5 text-muted-foreground"/> Media Assets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base">Thumbnail Image <span className="text-red-500">*</span></Label>
                <div className="p-1 border rounded-xl bg-muted/20">
                  <FileUpload 
                    initialImages={thumbnail ? [thumbnail] : []}
                    onChange={(urls) => setThumbnail(urls[0] || "")} 
                  />
                </div>
                <p className="text-xs text-muted-foreground">Main image shown on the shop page. Recommended size: 1200x900px.</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-base">Gallery Images</Label>
                <FileUpload 
                  initialImages={gallery}
                  onChange={(urls) => setGallery(urls)} 
                />
                <p className="text-xs text-muted-foreground">Additional screenshots to show product details.</p>
              </div>
            </CardContent>
          </Card>

          {/* 3. Features List */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Product Features</CardTitle>
              <Button type="button" variant="secondary" size="sm" onClick={addFeature}>
                <Plus className="w-4 h-4 mr-1"/> Add Feature
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-3 items-center group">
                  <div className="grid place-items-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {index + 1}
                  </div>
                  <Input 
                    value={feature} 
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="e.g. Lifetime Access & Updates"
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeFeature(index)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {features.length === 0 && <p className="text-sm text-muted-foreground italic text-center py-4">No features added yet.</p>}
            </CardContent>
          </Card>
        </div>

        {/* === RIGHT COLUMN (4 cols) === */}
        <div className="lg:col-span-4 space-y-8">

          {/* 1. Status & Org */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Available</Label>
                    <p className="text-xs text-muted-foreground">Visible to customers</p>
                  </div>
                  <Switch 
                    checked={formData.isAvailable} 
                    onCheckedChange={(c) => setFormData(prev => ({...prev, isAvailable: c}))} 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Featured</Label>
                    <p className="text-xs text-muted-foreground">Pin to homepage</p>
                  </div>
                  <Switch 
                    checked={formData.isFeatured} 
                    onCheckedChange={(c) => setFormData(prev => ({...prev, isFeatured: c}))} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category <span className="text-red-500">*</span></Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(v) => setFormData(prev => ({...prev, categoryId: v}))}
                >
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 2. Pricing */}
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-muted-foreground"/> Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label>Regular Price (MRP)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">৳</span>
                  <Input 
                    name="regularPrice" 
                    type="number" 
                    value={formData.regularPrice} 
                    onChange={handleChange} 
                    className="pl-8" 
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sale Price (Selling)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-green-600 font-bold">৳</span>
                  <Input 
                    name="salePrice" 
                    type="number" 
                    value={formData.salePrice} 
                    onChange={handleChange} 
                    className="pl-8 font-bold text-green-700 border-green-200 bg-green-50/20" 
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Discount Badge */}
              {discountPercent > 0 ? (
                <div className="rounded-md bg-green-100 dark:bg-green-900/30 border border-green-200 p-3 flex justify-between items-center">
                  <div className="flex gap-2 items-center text-sm font-medium text-green-800 dark:text-green-300">
                     <Tag className="w-4 h-4" /> Discount
                  </div>
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                    {discountPercent}% OFF
                  </Badge>
                </div>
              ) : (
                <div className="rounded-md bg-muted p-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="w-4 h-4" />
                  <span>Set a lower Sale Price to show a discount badge.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Tags */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Tags & Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] border p-2 rounded-lg bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1 gap-1 text-xs">
                    {tag} 
                    <X className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors" onClick={() => removeTag(tag)}/>
                  </Badge>
                ))}
                <input 
                  className="flex-1 bg-transparent border-none outline-none text-sm min-w-[80px] h-6"
                  placeholder={tags.length === 0 ? "Type tag & Enter..." : ""}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
              </div>
              <p className="text-xs text-muted-foreground">Press <strong>Enter</strong> or <strong>Comma</strong> to add.</p>
            </CardContent>
          </Card>

        </div>
      </div>
    </motion.div>
  );
}