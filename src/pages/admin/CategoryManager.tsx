import React, { useState } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { Category } from '../../types';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Layers, 
  AlertCircle, 
  Check, 
  ExternalLink, 
  X, 
  Loader2,
  FolderPlus,
  Package
} from 'lucide-react';
import { ImageAttachmentUploader } from '../../components/admin/ImageAttachmentUploader';

interface CategoryManagerProps {
  onOpenStorefrontCategory?: (catName: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ onOpenStorefrontCategory }) => {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useSiteSettings();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Delete modal state
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculate live product count for each category
  const getProductCount = (catName: string) => {
    return products.filter(p => p.category.toLowerCase() === catName.toLowerCase()).length;
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImages(['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop']);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    setDescription(category.description || '');
    setImages(category.imageUrl ? [category.imageUrl] : ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop']);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Category name is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    const formattedSlug = (slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    const imageUrl = images[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop';

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: name.trim(),
          slug: formattedSlug,
          description: description.trim(),
          imageUrl
        });
        setSuccessMessage(`Category "${name.trim()}" updated successfully.`);
      } else {
        await addCategory({
          name: name.trim(),
          slug: formattedSlug,
          description: description.trim(),
          imageUrl
        });
        setSuccessMessage(`Category "${name.trim()}" added successfully.`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      console.error('Error saving category:', err);
      setErrorMessage(err.message || 'Failed to save category. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCategory(categoryToDelete.id);
      setSuccessMessage(`Category "${categoryToDelete.name}" deleted.`);
      setCategoryToDelete(null);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      console.error('Error deleting category:', err);
      alert('Failed to delete category: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1c1c28]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#d4af37]">
              Taxonomy & Collections
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white uppercase mt-0.5">
            Category Management
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Add new categories or remove existing ones. Updates instantly sync across the navbar, shop filters, and product editor.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#d4af37] hover:bg-[#e5c158] text-[#0a0a0c] text-xs font-bold uppercase tracking-wider rounded-xs transition-all shadow-md shadow-[#d4af37]/10 cursor-pointer shrink-0"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Feedback Messages */}
      {successMessage && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-600/60 rounded-xs text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#111118] border border-[#1f1f2c] rounded-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider block">
              Total Categories
            </span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">
              {categories.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#1b1b26] border border-[#272738] flex items-center justify-center text-[#d4af37]">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#111118] border border-[#1f1f2c] rounded-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider block">
              Catalog Products
            </span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">
              {products.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#1b1b26] border border-[#272738] flex items-center justify-center text-[#d4af37]">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#111118] border border-[#1f1f2c] rounded-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider block">
              Quick Action
            </span>
            <span className="text-xs font-medium text-[#d4af37] mt-1 block">
              Real-time Firestore Sync
            </span>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-3 py-1.5 bg-[#1b1b26] hover:bg-[#252535] text-[#d4af37] border border-[#d4af37]/40 rounded-xs text-[11px] font-mono uppercase cursor-pointer"
          >
            + Create
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex items-center gap-3 bg-[#111118] p-3 border border-[#1f1f2c] rounded-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
          <input
            id="admin-category-search"
            name="categorySearch"
            type="text"
            placeholder="Search categories by name, slug or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#171722] border border-[#272738] text-white text-xs rounded-xs focus:outline-hidden focus:border-[#d4af37] font-mono placeholder:text-[#52525b]"
            autoComplete="off"
          />
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-[#a1a1aa] hover:text-white px-2 py-1 font-mono cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Categories Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => {
          const productCount = getProductCount(category.name);

          return (
            <div
              key={category.id}
              className="group bg-[#111118] border border-[#1f1f2c] hover:border-[#38384f] rounded-xs overflow-hidden flex flex-col justify-between transition-all"
            >
              <div>
                {/* Category Cover Image Header */}
                <div className="relative h-36 bg-[#161622] overflow-hidden">
                  <img
                    src={category.imageUrl || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop'}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111118] via-black/40 to-transparent" />
                  
                  {/* Category Name Badge on Image */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4af37] block">
                        Category
                      </span>
                      <h3 className="font-serif text-lg font-bold text-white uppercase drop-shadow-md">
                        {category.name}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 bg-black/70 backdrop-blur-xs border border-white/10 text-white font-mono text-[10px] rounded-xs">
                      {productCount} {productCount === 1 ? 'piece' : 'pieces'}
                    </span>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#71717a]">
                    <span>Slug:</span>
                    <span className="text-[#a1a1aa] bg-[#171722] px-1.5 py-0.5 rounded-xs border border-[#272738]">
                      /{category.slug || category.name.toLowerCase()}
                    </span>
                  </div>

                  <p className="text-xs text-[#a1a1aa] line-clamp-2 min-h-[2.5rem]">
                    {category.description || 'No description provided. Refined sartorial curation for modern discerning clientele.'}
                  </p>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="p-3 bg-[#0e0e14] border-t border-[#1a1a24] flex items-center justify-between gap-2">
                {onOpenStorefrontCategory ? (
                  <button
                    onClick={() => onOpenStorefrontCategory(category.name)}
                    className="text-[11px] font-mono text-[#60a5fa] hover:text-[#93c5fd] flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Storefront View</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-[#52525b]">
                    ID: {category.id.slice(0, 12)}
                  </span>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(category)}
                    className="p-1.5 text-[#a1a1aa] hover:text-[#d4af37] hover:bg-[#1b1b26] rounded-xs transition-colors cursor-pointer"
                    title="Edit category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCategoryToDelete(category)}
                    className="p-1.5 text-[#a1a1aa] hover:text-red-400 hover:bg-red-950/30 rounded-xs transition-colors cursor-pointer"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="p-12 text-center bg-[#111118] border border-[#1f1f2c] rounded-xs space-y-3">
          <Layers className="w-10 h-10 text-[#52525b] mx-auto" />
          <h3 className="font-serif text-lg text-white">No Categories Found</h3>
          <p className="text-xs text-[#71717a] max-w-sm mx-auto">
            {searchTerm ? `No categories match "${searchTerm}".` : 'You currently have no categories. Add your first category to organize your products.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-wider rounded-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Category</span>
          </button>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#111118] border border-[#272738] rounded-xs shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#20202e] mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4af37] block">
                  {editingCategory ? 'Update Taxonomy' : 'Create Taxonomy'}
                </span>
                <h3 className="font-serif text-lg font-bold text-white uppercase">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#71717a] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Category Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4af37] mb-1.5">
                  Category Name * (e.g. Panjabi, Shirts, Trousers)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Panjabi, Polo, Outerwear"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-[#181824] border border-[#2a2a3c] text-white p-2.5 rounded-xs text-xs focus:border-[#d4af37] focus:outline-hidden"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-1.5">
                  URL Slug (Automated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. panjabi"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                  className="w-full bg-[#181824] border border-[#2a2a3c] text-[#a1a1aa] p-2.5 rounded-xs text-xs font-mono focus:border-[#d4af37] focus:outline-hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description for curation and shop banner..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#181824] border border-[#2a2a3c] text-white p-2.5 rounded-xs text-xs focus:border-[#d4af37] focus:outline-hidden"
                />
              </div>

              {/* Gallery Image Attachment */}
              <div className="pt-2 border-t border-[#1c1c28]">
                <ImageAttachmentUploader
                  images={images}
                  onChange={(newImgs) => setImages(newImgs)}
                  multiple={false}
                  maxImages={1}
                  label="Category Cover Image"
                  description="Attach a luxury representative picture from your phone gallery or computer."
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#20202e] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#1b1b26] hover:bg-[#252535] text-[#a1a1aa] hover:text-white text-xs font-medium rounded-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#d4af37] hover:bg-[#e5c158] text-[#09090c] text-xs font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Eliminating window.confirm) */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-[#12121a] border border-red-900/50 rounded-xs shadow-2xl p-6">
            
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif text-lg font-bold text-white uppercase">
                Delete Category?
              </h3>
            </div>

            <p className="text-xs text-[#d4d4d8] leading-relaxed">
              Are you sure you want to delete the category <span className="font-bold text-[#d4af37]">"{categoryToDelete.name}"</span>?
            </p>

            {getProductCount(categoryToDelete.name) > 0 && (
              <div className="mt-3 p-3 bg-amber-950/40 border border-amber-800/60 rounded-xs text-amber-200 text-xs">
                ⚠️ Notice: There are currently <strong className="text-amber-100">{getProductCount(categoryToDelete.name)} products</strong> assigned to this category. They will remain in catalog but should be reassigned.
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 bg-[#1c1c28] hover:bg-[#262638] text-xs text-[#a1a1aa] hover:text-white rounded-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
