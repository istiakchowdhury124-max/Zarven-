import React, { useState } from 'react';
import { Banner, BannerPlacement } from '../../types';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  MousePointerClick,
  AlertCircle,
  Loader2,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { ImageAttachmentUploader } from '../../components/admin/ImageAttachmentUploader';

interface BannerManagerProps {
  onOpenNewBannerModal: boolean;
  onResetNewBannerModal: () => void;
}

export const BannerManager: React.FC<BannerManagerProps> = ({
  onOpenNewBannerModal,
  onResetNewBannerModal
}) => {
  const { banners, addBanner, updateBanner, deleteBanner } = useSiteSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [placementFilter, setPlacementFilter] = useState<string>('all');

  // UI feedback states (No window.alert to avoid iframe sandbox crashes)
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Delete confirmation modal state
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<{
    id: string;
    title: string;
    subtitle: string;
    placement: BannerPlacement;
    imageUrl: string;
    mobileImageUrl: string;
    targetUrl: string;
    ctaText: string;
    startDate: string;
    endDate: string;
    active: boolean;
    displayOrder: number;
  }>({
    id: '',
    title: '',
    subtitle: '',
    placement: 'between_sections',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
    mobileImageUrl: '',
    targetUrl: '/shop',
    ctaText: 'Explore Collection',
    startDate: '',
    endDate: '',
    active: true,
    displayOrder: 1
  });

  React.useEffect(() => {
    if (onOpenNewBannerModal) {
      handleOpenCreate();
      onResetNewBannerModal();
    }
  }, [onOpenNewBannerModal]);

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setErrorMessage('');
    setFormData({
      id: `banner-${Date.now()}`,
      title: '',
      subtitle: '',
      placement: 'bottom_ad',
      imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1920&auto=format&fit=crop',
      mobileImageUrl: '',
      targetUrl: '/shop?category=Outerwear',
      ctaText: 'Discover Outerwear',
      startDate: '',
      endDate: '',
      active: true,
      displayOrder: banners.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setErrorMessage('');
    setFormData({
      id: banner.id,
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      placement: banner.placement || 'between_sections',
      imageUrl: banner.imageUrl || '',
      mobileImageUrl: banner.mobileImageUrl || '',
      targetUrl: banner.targetUrl || '/shop',
      ctaText: banner.ctaText || 'Explore',
      startDate: banner.startDate || '',
      endDate: banner.endDate || '',
      active: banner.active ?? true,
      displayOrder: banner.displayOrder || 1
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await updateBanner(banner.id, { active: !banner.active });
      setSuccessMessage(`Banner "${banner.title}" is now ${!banner.active ? 'active' : 'hidden'}.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage('Failed to update banner status: ' + (err.message || 'Unknown error'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!bannerToDelete) return;
    setIsDeleting(true);
    try {
      await deleteBanner(bannerToDelete.id);
      setSuccessMessage(`Banner "${bannerToDelete.title}" deleted.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setBannerToDelete(null);
    } catch (err: any) {
      setErrorMessage('Failed to delete banner: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMessage('Banner title is required.');
      return;
    }
    if (!formData.imageUrl.trim()) {
      setErrorMessage('A banner image is required. Please attach a photo or provide a valid image URL.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const bannerData = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        placement: formData.placement,
        imageUrl: formData.imageUrl.trim(),
        mobileImageUrl: formData.mobileImageUrl.trim(),
        targetUrl: formData.targetUrl.trim() || '/shop',
        ctaText: formData.ctaText.trim() || 'Explore',
        startDate: formData.startDate.trim(),
        endDate: formData.endDate.trim(),
        active: formData.active,
        displayOrder: Number(formData.displayOrder) || 1
      };

      if (editingBanner) {
        await updateBanner(editingBanner.id, bannerData);
        setSuccessMessage(`Banner "${formData.title}" saved successfully.`);
      } else {
        await addBanner({
          id: formData.id || `banner-${Date.now()}`,
          ...bannerData
        });
        setSuccessMessage(`New advertising banner "${formData.title}" created.`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err: any) {
      console.error('Error saving banner:', err);
      setErrorMessage('Failed to save banner: ' + (err.message || 'Please check your connection and try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  const filteredBanners = banners.filter(b => {
    if (placementFilter !== 'all' && b.placement !== placementFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast notifications */}
      {successMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-600/50 rounded-xs flex items-center justify-between text-emerald-200 text-xs">
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
        <div className="p-3 bg-red-950/80 border border-red-600/50 rounded-xs flex items-center justify-between text-red-200 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#1c1c28]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37]">
            Marketing & Advertising Studio
          </span>
          <h1 className="font-serif text-2xl font-bold text-white uppercase">
            Storefront Banners ({banners.length})
          </h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d4af37] hover:bg-[#e5c158] text-black text-xs font-semibold uppercase tracking-wider rounded-xs cursor-pointer shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Banner</span>
        </button>
      </div>

      {/* Filter by placement */}
      <div className="flex gap-2 border-b border-[#20202c] pb-3 text-xs overflow-x-auto">
        {[
          { id: 'all', label: 'All Banners' },
          { id: 'hero', label: 'Homepage Hero' },
          { id: 'between_sections', label: 'Mid-Page Promos' },
          { id: 'bottom_ad', label: 'Dedicated Bottom Ad' },
          { id: 'footer', label: 'Footer Announcement' }
        ].map(pl => (
          <button
            key={pl.id}
            onClick={() => setPlacementFilter(pl.id)}
            className={`px-3 py-1.5 rounded-xs transition-colors shrink-0 cursor-pointer ${
              placementFilter === pl.id
                ? 'bg-[#1e1e2c] text-[#d4af37] font-semibold'
                : 'text-[#71717a] hover:text-white'
            }`}
          >
            {pl.label}
          </button>
        ))}
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBanners.map(b => (
          <div key={b.id} className="bg-[#121218] border border-[#20202c] rounded-xs overflow-hidden flex flex-col justify-between hover:border-[#d4af37]/40 transition-colors">
            <div>
              {/* Preview Image */}
              <div className="relative aspect-16/9 bg-[#181824] overflow-hidden">
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-xs text-[10px] font-mono uppercase bg-black/80 text-[#d4af37] border border-[#d4af37]/40">
                  {b.placement}
                </div>
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-xs text-[10px] font-mono bg-black/80 text-white">
                  Order #{b.displayOrder}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <h4 className="font-serif text-sm text-white font-semibold line-clamp-1">{b.title}</h4>
                {b.subtitle && (
                  <p className="text-xs text-[#a1a1aa] line-clamp-2">{b.subtitle}</p>
                )}
                <div className="flex items-center gap-4 text-[11px] font-mono text-[#71717a] pt-1">
                  <span className="flex items-center gap-1">
                    <MousePointerClick className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span className="text-white font-semibold">{b.clickCount || 0}</span> clicks
                  </span>
                  <span className="truncate max-w-[140px] text-[#a1a1aa]">Target: {b.targetUrl}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-[#1c1c28] flex items-center justify-between text-xs">
              <button
                onClick={() => handleToggleActive(b)}
                className={`px-2.5 py-1 rounded-xs text-[10px] font-mono uppercase cursor-pointer transition-colors ${
                  b.active
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800 hover:bg-emerald-900/60'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                {b.active ? 'Active' : 'Inactive'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(b)}
                  className="p-1.5 text-[#a1a1aa] hover:text-[#d4af37] transition-colors cursor-pointer"
                  title="Edit banner"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setBannerToDelete(b)}
                  className="p-1.5 text-[#a1a1aa] hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredBanners.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-[#20202c] rounded-xs p-8 text-[#71717a]">
            <p className="text-sm">No banners found in this category.</p>
            <button
              onClick={handleOpenCreate}
              className="mt-3 text-xs text-[#d4af37] hover:underline cursor-pointer uppercase tracking-wider"
            >
              + Create a new advertising banner
            </button>
          </div>
        )}
      </div>

      {/* Edit / Create Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div onClick={() => !isSaving && setIsModalOpen(false)} className="fixed inset-0 bg-black/85 backdrop-blur-xs" />
          <div className="relative min-h-screen p-4 flex items-center justify-center">
            <div className="relative w-full max-w-xl bg-[#121218] border border-[#272738] rounded-xs p-6 sm:p-8 space-y-6 my-8 shadow-2xl">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#20202e]">
                <h3 className="font-serif text-lg font-bold text-white uppercase">
                  {editingBanner ? 'Edit Banner Configuration' : 'Create Advertising Banner'}
                </h3>
                <button 
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)} 
                  className="text-[#a1a1aa] hover:text-white cursor-pointer disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-950/80 border border-red-600/50 rounded-xs flex items-center gap-2 text-red-200 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
                <div>
                  <label className="text-[#a1a1aa] uppercase font-mono tracking-wider block mb-1">
                    Banner Title / Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. ZARVEN PRIVÉ ATELIER ACCESS"
                    className="w-full bg-[#181824] border border-[#272738] text-white px-3.5 py-2.5 rounded-xs focus:outline-hidden focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-[#a1a1aa] uppercase font-mono tracking-wider block mb-1">
                    Subtitle or Promotional Description
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="e.g. Sign up for private trunk shows and priority releases."
                    className="w-full bg-[#181824] border border-[#272738] text-white px-3.5 py-2.5 rounded-xs focus:outline-hidden focus:border-[#d4af37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#a1a1aa] uppercase font-mono tracking-wider block mb-1">Placement Slot *</label>
                    <select
                      value={formData.placement}
                      onChange={(e) => setFormData(prev => ({ ...prev, placement: e.target.value as BannerPlacement }))}
                      className="w-full bg-[#181824] border border-[#272738] text-white px-3 py-2.5 rounded-xs focus:outline-hidden focus:border-[#d4af37]"
                    >
                      <option value="hero">Homepage Hero</option>
                      <option value="between_sections">Between Product Sections</option>
                      <option value="bottom_ad">Dedicated Bottom-of-Page Ad</option>
                      <option value="footer">Footer Announcement</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#a1a1aa] uppercase font-mono tracking-wider block mb-1">Display Order</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: Math.max(1, parseInt(e.target.value) || 1) }))}
                      className="w-full bg-[#181824] border border-[#272738] text-white px-3 py-2.5 rounded-xs focus:outline-hidden focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                {/* Desktop Banner Graphic */}
                <div className="p-3.5 bg-[#161620] border border-[#232332] rounded-xs space-y-3">
                  <ImageAttachmentUploader
                    images={formData.imageUrl ? [formData.imageUrl] : []}
                    onChange={(imgs) => setFormData(prev => ({ ...prev, imageUrl: imgs[0] || '' }))}
                    label="Desktop Banner Picture (Gallery Attachment)"
                    description="Attach photo directly from your device gallery, or type image URL below."
                    multiple={false}
                  />

                  <div>
                    <label className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider block mb-1">
                      Direct Image URL (Alternative)
                    </label>
                    <input
                      type="text"
                      value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder={formData.imageUrl.startsWith('data:') ? '(Gallery photo attached above)' : 'https://...'}
                      className="w-full bg-[#101017] border border-[#232332] text-xs text-white px-3 py-1.5 rounded-xs focus:outline-hidden focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                {/* Mobile Banner Graphic */}
                <div className="p-3.5 bg-[#161620] border border-[#232332] rounded-xs space-y-3">
                  <ImageAttachmentUploader
                    images={formData.mobileImageUrl ? [formData.mobileImageUrl] : []}
                    onChange={(imgs) => setFormData(prev => ({ ...prev, mobileImageUrl: imgs[0] || '' }))}
                    label="Mobile Banner Picture (Optional)"
                    description="Optional vertical or square graphic optimized for phone screens."
                    multiple={false}
                  />

                  <div>
                    <label className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider block mb-1">
                      Mobile Direct Image URL (Alternative)
                    </label>
                    <input
                      type="text"
                      value={formData.mobileImageUrl.startsWith('data:') ? '' : formData.mobileImageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, mobileImageUrl: e.target.value }))}
                      placeholder={formData.mobileImageUrl.startsWith('data:') ? '(Gallery photo attached above)' : 'https://...'}
                      className="w-full bg-[#101017] border border-[#232332] text-xs text-white px-3 py-1.5 rounded-xs focus:outline-hidden focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#a1a1aa] uppercase font-mono tracking-wider block mb-1">Destination URL</label>
                    <input
                      type="text"
                      value={formData.targetUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetUrl: e.target.value }))}
                      placeholder="/shop or https://..."
                      className="w-full bg-[#181824] border border-[#272738] text-white px-3 py-2.5 rounded-xs focus:outline-hidden focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-[#a1a1aa] uppercase font-mono tracking-wider block mb-1">Button CTA Text</label>
                    <input
                      type="text"
                      value={formData.ctaText}
                      onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                      placeholder="e.g. Book Private Fitting"
                      className="w-full bg-[#181824] border border-[#272738] text-white px-3 py-2.5 rounded-xs focus:outline-hidden focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-2 text-white">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="accent-[#d4af37]"
                  />
                  <span>Active & visible on storefront</span>
                </label>

                <div className="pt-4 border-t border-[#20202e] flex justify-end gap-3">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 border border-[#272738] text-white text-xs uppercase tracking-wider rounded-xs cursor-pointer hover:bg-[#1a1a24] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#d4af37] hover:bg-[#e5c158] text-black text-xs uppercase tracking-wider font-semibold rounded-xs shadow-md transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Banner</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {bannerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => !isDeleting && setBannerToDelete(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-md bg-[#121218] border border-[#272738] rounded-xs p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-white uppercase">
              Delete Banner
            </h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Are you sure you want to remove the banner <strong className="text-white">"{bannerToDelete.title}"</strong>? This will remove it from all storefront placements immediately.
            </p>
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setBannerToDelete(null)}
                className="px-4 py-2 border border-[#272738] text-white text-xs uppercase tracking-wider rounded-xs hover:bg-[#1a1a24] cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider font-semibold rounded-xs cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
