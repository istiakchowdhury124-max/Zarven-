import React, { useState } from 'react';
import { Product } from '../../types';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  AlertCircle,
  Sparkles,
  Loader2,
  Layers
} from 'lucide-react';
import { LuxuryFallbackImage } from '../../components/common/LuxuryFallbackImage';
import { ImageAttachmentUploader } from '../../components/admin/ImageAttachmentUploader';

interface ProductManagerProps {
  onOpenNewProductModal: boolean;
  onResetNewProductModal: () => void;
  onNavigateCategories?: () => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({
  onOpenNewProductModal,
  onResetNewProductModal,
  onNavigateCategories
}) => {
  const { products, categories, currencyFormat, deleteProduct } = useSiteSettings();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Custom confirmation modal state (eliminating window.confirm)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Draft auto-save state
  const DRAFT_STORAGE_KEY = 'zarven_new_product_draft';
  const MODAL_OPEN_STORAGE_KEY = 'zarven_product_modal_open';
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    id: string;
    title: string;
    sku: string;
    description: string;
    category: string;
    price: number;
    salePrice: number | '';
    stock: number;
    sizes: string;
    colors: string;
    images: string[];
    tags: string;
    isFeatured: boolean;
    isNewArrival: boolean;
    isBestSeller: boolean;
    published: boolean;
  }>({
    id: '',
    title: '',
    sku: '',
    description: '',
    category: 'Tailoring',
    price: 9500,
    salePrice: '',
    stock: 15,
    sizes: '38R, 40R, 42R, 44R',
    colors: 'Obsidian Black (#111114), Ivory Cream (#f6f4ee)',
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop'],
    tags: 'Tailoring, Virgin Wool, Bespoke',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    published: true
  });

  // 1. Auto-restore draft and reopen modal on mount if the user previously left
  React.useEffect(() => {
    try {
      const savedModalOpen = localStorage.getItem(MODAL_OPEN_STORAGE_KEY);
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object') {
          const hasTypedContent = Boolean(
            parsed.title?.trim() || 
            parsed.description?.trim() || 
            (parsed.images && parsed.images.length > 1) || 
            (parsed.price && parsed.price !== 9500 && parsed.price !== 12000)
          );
          if (hasTypedContent) {
            setEditingProduct(null);
            setFormData(prev => ({
              ...prev,
              ...parsed,
              id: parsed.id || `prod-${Date.now()}`
            }));
            setIsDraftRestored(true);
            if (savedModalOpen === 'true') {
              setIsEditModalOpen(true);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to restore draft from localStorage:', e);
    }
  }, []);

  // 2. Auto-save in-progress new product draft whenever formData changes
  React.useEffect(() => {
    if (!editingProduct && isEditModalOpen) {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
        localStorage.setItem(MODAL_OPEN_STORAGE_KEY, 'true');
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastAutoSavedTime(timeStr);
      } catch (e) {
        console.warn('Failed to auto-save product draft:', e);
      }
    }
  }, [formData, editingProduct, isEditModalOpen]);

  // Open Add modal if triggered externally
  React.useEffect(() => {
    if (onOpenNewProductModal) {
      handleOpenCreate();
      onResetNewProductModal();
    }
  }, [onOpenNewProductModal]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    let initialData = {
      id: `prod-${Date.now()}`,
      title: '',
      sku: `ZAR-${Math.floor(100 + Math.random() * 900)}`,
      description: '',
      category: categories[0]?.name || 'Tailoring',
      price: 12000,
      salePrice: '' as number | '',
      stock: 20,
      sizes: 'S, M, L, XL',
      colors: 'Obsidian Black (#111114), Charcoal (#27272e)',
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop'],
      tags: 'Tailoring, New Arrival',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      published: true
    };

    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object') {
          const hasTypedContent = Boolean(
            parsed.title?.trim() || 
            parsed.description?.trim() || 
            (parsed.images && parsed.images.length > 1) || 
            (parsed.price && parsed.price !== 12000)
          );
          if (hasTypedContent) {
            initialData = { ...initialData, ...parsed };
            setIsDraftRestored(true);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to read draft on create:', e);
    }

    setFormData(initialData);
    setErrorMessage('');
    setIsEditModalOpen(true);
    try {
      localStorage.setItem(MODAL_OPEN_STORAGE_KEY, 'true');
    } catch {}
  };

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem(MODAL_OPEN_STORAGE_KEY);
    } catch {}
    setIsDraftRestored(false);
    setFormData({
      id: `prod-${Date.now()}`,
      title: '',
      sku: `ZAR-${Math.floor(100 + Math.random() * 900)}`,
      description: '',
      category: categories[0]?.name || 'Tailoring',
      price: 12000,
      salePrice: '',
      stock: 20,
      sizes: 'S, M, L, XL',
      colors: 'Obsidian Black (#111114), Charcoal (#27272e)',
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop'],
      tags: 'Tailoring, New Arrival',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      published: true
    });
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    try {
      localStorage.removeItem(MODAL_OPEN_STORAGE_KEY);
    } catch {}
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      title: product.title,
      sku: product.sku,
      description: product.description,
      category: product.category,
      price: product.price,
      salePrice: product.salePrice ?? '',
      stock: product.stock,
      sizes: product.sizes.join(', '),
      colors: product.colors.map(c => `${c.name} (${c.hex})`).join(', '),
      images: Array.isArray(product.images) ? product.images : [],
      tags: product.tags.join(', '),
      isFeatured: !!product.isFeatured,
      isNewArrival: !!product.isNewArrival,
      isBestSeller: !!product.isBestSeller,
      published: product.published
    });
    setErrorMessage('');
    setIsEditModalOpen(true);
  };

  const handleTogglePublish = async (product: Product) => {
    try {
      const newStatus = !product.published;
      const ref = doc(db, 'products', product.id);
      await updateDoc(ref, {
        published: newStatus,
        updatedAt: new Date().toISOString()
      });
      setSuccessMessage(`Product "${product.title}" is now ${newStatus ? 'Published' : 'Hidden'}.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Toggle publish error:', err);
      setErrorMessage('Failed to update status in Firestore: ' + err.message);
    }
  };

  // Safe In-App Delete Execution
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      const deletedTitle = productToDelete.title;
      setProductToDelete(null);
      setIsEditModalOpen(false);
      setSuccessMessage(`Successfully deleted "${deletedTitle}" from the catalog.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setErrorMessage('Could not delete product from Firestore: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.title.trim()) {
      setErrorMessage('Product title is required.');
      return;
    }
    if (formData.price <= 0) {
      setErrorMessage('Price must be greater than 0 BDT.');
      return;
    }
    if (formData.stock < 0) {
      setErrorMessage('Stock cannot be negative.');
      return;
    }

    setIsSaving(true);

    try {
      const parsedSizes = formData.sizes.split(',').map(s => s.trim()).filter(Boolean);
      
      const parsedColors = formData.colors.split(',').map(raw => {
        const match = raw.match(/^(.*?)\s*\((.*?)\)$/);
        if (match) {
          return { name: match[1].trim(), hex: match[2].trim() };
        }
        return { name: raw.trim(), hex: '#111114' };
      }).filter(c => c.name);

      const parsedTags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const productPayload: Product = {
        id: formData.id || `prod-${Date.now()}`,
        title: formData.title.trim(),
        slug,
        sku: formData.sku.trim() || `ZAR-${Date.now().toString().slice(-4)}`,
        description: formData.description.trim(),
        category: formData.category,
        price: Number(formData.price),
        salePrice: formData.salePrice !== '' ? Number(formData.salePrice) : null,
        stock: Number(formData.stock),
        sizes: parsedSizes.length > 0 ? parsedSizes : ['Standard'],
        colors: parsedColors.length > 0 ? parsedColors : [{ name: 'Obsidian', hex: '#111114' }],
        images: formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop'],
        tags: parsedTags,
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        isBestSeller: formData.isBestSeller,
        published: formData.published,
        createdAt: editingProduct?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'products', productPayload.id), productPayload);

      // Clean up draft storage upon successful save
      if (!editingProduct) {
        try {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
          localStorage.removeItem(MODAL_OPEN_STORAGE_KEY);
        } catch {}
        setIsDraftRestored(false);
      }

      setIsEditModalOpen(false);
      try {
        localStorage.removeItem(MODAL_OPEN_STORAGE_KEY);
      } catch {}

      setSuccessMessage(editingProduct ? `Updated "${productPayload.title}" successfully.` : `Added "${productPayload.title}" to catalog.`);
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err: any) {
      console.error('Save product error:', err);
      setErrorMessage('Failed to save product in Firestore: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = searchTerm === '' || 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs rounded-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-950/80 border border-red-700 text-red-200 text-xs rounded-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#20202e]">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-white font-bold">
            Garment Catalog Management
          </h2>
          <p className="text-xs text-[#71717a] mt-0.5">
            Create, edit, publish/unpublish, and remove luxury garments ({products.length} total pieces).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onNavigateCategories && (
            <button
              onClick={onNavigateCategories}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#181824] hover:bg-[#222232] text-[#d4af37] border border-[#d4af37]/40 text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Manage Categories</span>
            </button>
          )}

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#d4af37] hover:bg-[#e5c158] text-[#0a0a0c] text-xs uppercase tracking-wider font-semibold rounded-xs shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#71717a] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, SKU, or keyword..."
            className="w-full bg-[#181824] border border-[#272738] text-xs text-white pl-9 pr-3 py-2 rounded-xs focus:outline-hidden focus:border-[#d4af37]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#181824] border border-[#272738] text-xs text-white px-3 py-2 rounded-xs focus:outline-hidden focus:border-[#d4af37] w-full sm:w-auto"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-[#121218] border border-[#20202c] rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1c1c28] text-[10px] font-mono uppercase tracking-wider text-[#71717a] bg-[#0e0e14]">
                <th className="py-3 px-4 font-medium">Garment</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">SKU</th>
                <th className="py-3 px-4 font-medium">Price</th>
                <th className="py-3 px-4 font-medium">Stock</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181822]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#161622] transition-colors">
                  
                  {/* Thumbnail & Title */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 rounded-xs overflow-hidden bg-[#181824] shrink-0 border border-[#272738]">
                        <LuxuryFallbackImage
                          src={p.images[0]}
                          alt={p.title}
                          aspectRatio="3/4"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-serif font-medium text-white block truncate max-w-xs">
                          {p.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {p.isFeatured && (
                            <span className="text-[9px] font-mono uppercase text-[#d4af37] bg-[#d4af37]/10 px-1.5 py-0.2 rounded-xs">
                              Featured
                            </span>
                          )}
                          {p.isBestSeller && (
                            <span className="text-[9px] font-mono uppercase text-amber-400 bg-amber-950/40 px-1.5 py-0.2 rounded-xs">
                              Best Seller
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 font-mono text-[#a1a1aa]">
                    {p.category}
                  </td>

                  {/* SKU */}
                  <td className="py-3 px-4 font-mono text-[#71717a]">
                    {p.sku}
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4 font-mono">
                    {p.salePrice ? (
                      <div>
                        <span className="text-[#d4af37] font-semibold block">{currencyFormat(p.salePrice)}</span>
                        <span className="text-[#71717a] line-through text-[10px] block">{currencyFormat(p.price)}</span>
                      </div>
                    ) : (
                      <span className="text-white font-semibold">{currencyFormat(p.price)}</span>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="py-3 px-4 font-mono">
                    <span className={p.stock <= 5 ? 'text-red-400 font-bold' : 'text-[#86efac]'}>
                      {p.stock} units
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleTogglePublish(p)}
                      title="Click to toggle published status on live storefront"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-colors ${
                        p.published
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800 hover:bg-emerald-900/60'
                          : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                      }`}
                    >
                      {p.published ? 'Published' : 'Draft / Hidden'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-[#a1a1aa] hover:text-[#d4af37] hover:bg-[#1f1f2e] rounded-xs transition-colors cursor-pointer"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setProductToDelete(p)}
                        className="p-1.5 text-[#a1a1aa] hover:text-red-400 hover:bg-red-950/30 rounded-xs transition-colors cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#71717a]">
                    No garments found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-App Delete Confirmation Modal (100% Mobile & iFrame Compatible) */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div 
            onClick={() => !isDeleting && setProductToDelete(null)} 
            className="fixed inset-0 bg-black/85 backdrop-blur-xs transition-opacity" 
          />
          <div className="relative w-full max-w-md bg-[#121218] border border-red-900/60 rounded-xs p-6 sm:p-7 space-y-5 shadow-2xl z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-400 rounded-full shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white leading-tight">
                  Delete Garment?
                </h3>
                <p className="text-xs text-[#a1a1aa] mt-2 leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-white font-medium">"{productToDelete.title}"</strong> (SKU: <span className="font-mono text-[#d4af37]">{productToDelete.sku}</span>)?
                </p>
                <p className="text-[11px] text-red-300/80 mt-1.5">
                  This action removes the piece immediately from the live storefront and cannot be undone.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#20202e] flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 border border-[#272738] text-white text-xs uppercase tracking-wider rounded-xs hover:bg-[#1a1a24] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider font-semibold rounded-xs shadow-lg transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Edit / Add Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div onClick={handleCloseModal} className="fixed inset-0 bg-black/85 backdrop-blur-xs" />
          <div className="relative min-h-screen p-4 flex items-center justify-center">
            <div className="relative w-full max-w-2xl bg-[#121218] border border-[#272738] rounded-xs p-6 sm:p-8 space-y-6 my-8 z-10">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#20202e]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white uppercase">
                    {editingProduct ? 'Edit Catalog Piece' : 'Create New Luxury Garment'}
                  </h3>
                  {!editingProduct && (
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-mono">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>অটো-ড্রাফট সক্রিয় (Auto-save Active)</span>
                      </span>
                      {lastAutoSavedTime && (
                        <span className="text-[#71717a]">· সেভ: {lastAutoSavedTime}</span>
                      )}
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleCloseModal} 
                  className="text-[#a1a1aa] hover:text-white cursor-pointer p-1 rounded hover:bg-white/5"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Draft Restored Banner */}
              {!editingProduct && isDraftRestored && (
                <div className="p-3 bg-[#d4af37]/10 border border-[#d4af37]/40 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-[#d4af37]">
                    <Sparkles className="w-4 h-4 shrink-0 text-[#d4af37]" />
                    <span>
                      <strong>পূর্বের খসড়া রিস্টোর করা হয়েছে:</strong> ব্রাউজার বন্ধ করলেও আপনার টাইপ করা তথ্য অক্ষত আছে।
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearDraft}
                    className="text-xs text-rose-400 hover:text-rose-300 underline font-mono shrink-0 cursor-pointer text-left sm:text-right"
                  >
                    খসড়া মুছে নতুন ফর্ম নিন (Clear)
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-950/60 border border-red-800 text-xs text-red-200 rounded-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                
                {/* Title */}
                <div>
                  <label className="block text-white font-medium mb-1">Garment Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. The Obsidian Tailored Wool Blazer"
                    className="w-full bg-[#181824] border border-[#272738] text-white p-2.5 rounded-xs focus:border-[#d4af37] focus:outline-hidden"
                  />
                </div>

                {/* Category & SKU */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-[#181824] border border-[#272738] text-white p-2.5 rounded-xs focus:border-[#d4af37] focus:outline-hidden"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-1">SKU / Item Code</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="e.g. ZAR-JKT-001"
                      className="w-full bg-[#181824] border border-[#272738] text-white p-2.5 rounded-xs focus:border-[#d4af37] focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Price, Sale Price, Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-1">Regular Price (৳)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full bg-[#181824] border border-[#272738] text-white p-2.5 rounded-xs focus:border-[#d4af37] focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-1">Sale Price (৳ - Optional)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.salePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, salePrice: e.target.value === '' ? '' : Number(e.target.value) }))}
                      placeholder="Optional discount"
                      className="w-full bg-[#181824] border border-[#272738] text-white p-2.5 rounded-xs focus:border-[#d4af37] focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-1">Stock Units</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
                      className="w-full bg-[#181824] border border-[#272738] text-white p-2.5 rounded-xs focus:border-[#d4af37] focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white font-medium mb-1">Garment Description & Craftsmanship Details</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Details about fabric, Italian wool, canvasing, cut, and fit..."
                    className="w-full bg-[#181824] border border-[#272738] text-white p-2.5 rounded-xs focus:border-[#d4af37] focus:outline-hidden leading-relaxed"
                  />
                </div>

                {/* Sizes & Colors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-1">Available Sizes (Comma-separated)</label>
                    <input
                      type="text"
                      value={formData.sizes}
                      onChange={(e) => setFormData(prev => ({ ...prev, sizes: e.target.value }))}
                      placeholder="38R, 40R, 42R, 44R or S, M, L, XL"
                      className="w-full bg-[#181824] border border-[#272738] text-white p-2.5 rounded-xs focus:border-[#d4af37] focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-1">Color Palette (Name + Hex)</label>
                    <input
                      type="text"
                      value={formData.colors}
                      onChange={(e) => setFormData(prev => ({ ...prev, colors: e.target.value }))}
                      placeholder="Obsidian Black (#111114), Ivory (#f6f4ee)"
                      className="w-full bg-[#181824] border border-[#272738] text-white p-2.5 rounded-xs focus:border-[#d4af37] focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Gallery Photos Attachment */}
                <div className="p-3 bg-[#161620] border border-[#232332] rounded-xs">
                  <ImageAttachmentUploader
                    images={formData.images}
                    onChange={(newImages) => setFormData(prev => ({ ...prev, images: newImages }))}
                    label="Garment Pictures (Attach from Gallery)"
                    description="Tap button to attach photos from your phone gallery or computer. The first photo is the cover."
                    multiple={true}
                    maxImages={8}
                  />
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                      className="accent-[#d4af37]"
                    />
                    <span>Publish live on storefront</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="accent-[#d4af37]"
                    />
                    <span>Featured Homepage</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={formData.isNewArrival}
                      onChange={(e) => setFormData(prev => ({ ...prev, isNewArrival: e.target.checked }))}
                      className="accent-[#d4af37]"
                    />
                    <span>New Arrival</span>
                  </label>
                </div>

                {/* Modal Footer with Delete & Save buttons */}
                <div className="pt-4 border-t border-[#20202e] flex items-center justify-between gap-3">
                  {editingProduct ? (
                    <button
                      type="button"
                      onClick={() => {
                        setProductToDelete(editingProduct);
                      }}
                      className="px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/60 text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Product</span>
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-5 py-2.5 border border-[#272738] text-white text-xs uppercase tracking-wider rounded-xs hover:bg-[#1a1a24] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-[#d4af37] hover:bg-[#e5c158] text-black text-xs uppercase tracking-wider font-semibold rounded-xs shadow-md transition-colors cursor-pointer flex items-center gap-2"
                    >
                      {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{isSaving ? 'Synchronizing...' : 'Save & Publish to Store'}</span>
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
