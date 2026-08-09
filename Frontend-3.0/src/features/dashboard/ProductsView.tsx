import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Copy, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Product, SkinTone, Undertone, SkinType, SkinConcern } from '../../types';
import { Card, Button, Input, Select, Badge, Modal, Drawer } from '../../components/ui/UIComponents';

interface ProductsViewProps {
  products: Product[];
  /** Full master product catalog (all brands/products in the system), used only to auto-fill new listings. */
  masterCatalog: Product[];
  onAddProduct: (prod: Omit<Product, 'id' | 'clicks' | 'conversions' | 'revenueGenerated'>) => void;
  onUpdateProduct: (id: string, updated: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onCopyLink: (link: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  masterCatalog,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onCopyLink
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit Product Form State
  const [editPrice, setEditPrice] = useState('');
  const [editShade, setEditShade] = useState('');
  const [editAffiliateUrl, setEditAffiliateUrl] = useState('');
  const [editStatus, setEditStatus] = useState<Product['status']>('Active');
  const [editAffiliatorNote, setEditAffiliatorNote] = useState('');

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setEditPrice(prod.price.toString());
    setEditShade(prod.shade || '');
    setEditAffiliateUrl(prod.affiliateUrl);
    setEditStatus(prod.status);
    setEditAffiliatorNote(prod.affiliatorNote || '');
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    onUpdateProduct(editingProduct.id, {
      price: parseFloat(editPrice) || editingProduct.price,
      shade: editShade,
      affiliateUrl: editAffiliateUrl,
      status: editStatus,
      affiliatorNote: editAffiliatorNote,
    });
    setEditingProduct(null);
  };

  // Add Product Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<Product['category']>('Foundation');
  const [price, setPrice] = useState('42.00');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=600');
  const [affiliateUrl, setAffiliateUrl] = useState('https://amzn.to/3sample_beauty');
  const [shade, setShade] = useState('Medium Warm 220');
  const [affiliatorNote, setAffiliatorNote] = useState('My top recommendation for glass-skin finish!');
  const [autoScrapeUrl, setAutoScrapeUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');

  const handleSimulateScrape = () => {
    if (!autoScrapeUrl) return;
    setIsScraping(true);
    setTimeout(() => {
      setIsScraping(false);
      setName('Radiant Serum Concealer');
      setBrand('NARS Cosmetics');
      setPrice('32.00');
      setCategory('Concealer');
      setImageUrl('https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&q=80&w=600');
      setAffiliateUrl(autoScrapeUrl);
      setShade('Custard Medium 1');
    }, 1200);
  };

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct({
      productId: selectedProductId,
      name: name || 'Beauty Product',
      brand: brand || 'Sephora Brand',
      category,
      price: parseFloat(price) || 29.00,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=600',
      affiliateUrl: affiliateUrl.trim(),
      shade,
      suitableSkinTones: ['Fair', 'Light', 'Medium'],
      suitableUndertones: ['Warm', 'Neutral'],
      suitableSkinTypes: ['Combination', 'Oily', 'Normal'],
      targetsConcerns: ['Dullness', 'Hyperpigmentation'],
      matchScoreWeight: 95,
      status: 'Active',
      affiliatorNote
    });

    setIsAddOpen(false);
    // Reset form
    setName('');
    setBrand('');
    setAutoScrapeUrl('');
    setSelectedProductId('');
  };

  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase()) || prod.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || prod.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || prod.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">Affiliate Products Catalog</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage products matched by Aura to your followers' selfies</p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
        >
          Add Affiliate Product
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <Input
            placeholder="Search by product name or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4 text-zinc-400" />}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            options={[
              { label: 'Semua Kategori', value: 'All' },
              { label: '💋 Lips - Lip Tint', value: 'Lip Tint' },
              { label: '💋 Lips - Lip Cream', value: 'Lip Cream' },
              { label: '💋 Lips - Lipstick', value: 'Lipstick' },
              { label: '💋 Lips - Lip Velvet', value: 'Lip Velvet' },
              { label: '💋 Lips - Lip Gloss', value: 'Lip Gloss' },
              { label: '✨ Fade & Shade - Cushion', value: 'Cushion' },
              { label: '✨ Fade & Shade - Foundation', value: 'Foundation' },
              { label: '✨ Fade & Shade - Concealer', value: 'Concealer' },
              { label: '✨ Fade & Shade - Blush & Cheek Tint', value: 'Blush & Cheek Tint' },
              { label: '✨ Fade & Shade - Powder', value: 'Powder' },
              { label: '✨ Fade & Shade - Contour & Bronzer', value: 'Contour & Bronzer' },
            ]}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />

          <Select
            options={[
              { label: 'All Statuses', value: 'All' },
              { label: 'Active', value: 'Active' },
              { label: 'Draft', value: 'Draft' },
              { label: 'Out of Stock', value: 'Out of Stock' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </Card>

      {/* Product Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Product</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Affiliate Link</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">AI Clicks</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3 font-bold text-zinc-900 flex items-center gap-3 min-w-[200px]">
                    <img src={prod.imageUrl} alt={prod.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    <div>
                      <span className="block text-xs font-bold text-zinc-900 line-clamp-1">{prod.name}</span>
                      <span className="block text-[10px] text-zinc-400 font-medium">{prod.brand} {prod.shade ? `• ${prod.shade}` : ''}</span>
                    </div>
                  </td>

                  <td className="py-3 text-zinc-600 font-medium">{prod.category}</td>

                  <td className="py-3 font-bold text-zinc-900">${prod.price}</td>

                  <td className="py-3">
                    <button
                      onClick={() => onCopyLink(prod.affiliateUrl)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-[11px] font-mono transition-colors"
                      title="Copy Affiliate URL"
                    >
                      <LinkIcon className="w-3 h-3 text-[#F26CA7]" />
                      <span className="max-w-[120px] truncate">{prod.affiliateUrl}</span>
                      <Copy className="w-3 h-3 text-zinc-400" />
                    </button>
                  </td>

                  <td className="py-3">
                    <Badge variant={prod.status === 'Active' ? 'success' : 'outline'}>
                      {prod.status}
                    </Badge>
                  </td>

                  <td className="py-3 font-semibold text-zinc-800">{prod.clicks}</td>

                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(prod.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD PRODUCT MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Affiliate Product"
        description="Link a new beauty item to your Aura recommendation matchmaker."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveNewProduct} className="space-y-4 pt-2">
          
          {/* Master Catalog Auto-Fill Selector */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/70 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#F26CA7]" />
                Auto-Fill dari Master Product Catalog
              </label>
              <Badge variant="primary" size="sm">Master Catalog</Badge>
            </div>
            <select
              value={selectedProductId}
              onChange={(e) => {
                const selectedProd = masterCatalog.find(p => p.id === e.target.value);
                setSelectedProductId(e.target.value);
                if (selectedProd) {
                  setName(selectedProd.name);
                  setBrand(selectedProd.brand);
                  setCategory(selectedProd.category);
                  setPrice(selectedProd.price.toString());
                  setImageUrl(selectedProd.imageUrl);
                  // Affiliate link is intentionally left blank — each affiliator must supply their own tracked link.
                  setAffiliateUrl('');
                  setShade(selectedProd.shade || 'Universal');
                  setAffiliatorNote(selectedProd.affiliatorNote || 'Rekomendasi terbaik saya!');
                }
              }}
              className="w-full p-2.5 rounded-xl border border-purple-200 text-xs bg-white font-medium focus:ring-2 focus:ring-[#F26CA7]/30 focus:outline-none cursor-pointer"
            >
              <option value="" disabled>
                {masterCatalog.length === 0
                  ? '-- Master catalog belum termuat --'
                  : `-- Pilih dari ${masterCatalog.length} produk Master Catalog --`}
              </option>
              {masterCatalog.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.brand}] {p.name} - Rp{p.price.toLocaleString('id-ID')} ({p.category})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-500">
              Memilih produk master akan otomatis mengisi Judul, Brand, Kategori, Harga, Shade, dan Foto Produk. Produk hanya bisa ditambahkan dari Master Catalog saat ini.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Brand Name"
              placeholder="e.g. Rare Beauty"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
            <Input
              label="Product Title"
              placeholder="e.g. Soft Matte Lip Tint"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Kategori Produk"
              options={[
                { label: '💋 Lips - Lip Tint', value: 'Lip Tint' },
                { label: '💋 Lips - Lip Cream', value: 'Lip Cream' },
                { label: '💋 Lips - Lipstick', value: 'Lipstick' },
                { label: '💋 Lips - Lip Velvet', value: 'Lip Velvet' },
                { label: '💋 Lips - Lip Gloss', value: 'Lip Gloss' },
                { label: '💋 Lips - Lip Balm', value: 'Lip Balm' },
                { label: '✨ Fade & Shade - Cushion', value: 'Cushion' },
                { label: '✨ Fade & Shade - Foundation', value: 'Foundation' },
                { label: '✨ Fade & Shade - Concealer', value: 'Concealer' },
                { label: '✨ Fade & Shade - Blush & Cheek Tint', value: 'Blush & Cheek Tint' },
                { label: '✨ Fade & Shade - Powder', value: 'Powder' },
                { label: '✨ Fade & Shade - Contour & Bronzer', value: 'Contour & Bronzer' },
              ]}
              value={category}
              onChange={(e) => setCategory(e.target.value as Product['category'])}
            />
            <Input
              label="Price ($)"
              type="number"
              placeholder="38.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <Input
            label="Affiliate Link URL"
            placeholder="https://amzn.to/your_affiliate_code"
            value={affiliateUrl}
            onChange={(e) => setAffiliateUrl(e.target.value)}
            required
          />
          {selectedProductId && !affiliateUrl.trim() && (
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 -mt-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Wajib diisi — masukkan link affiliate kamu sendiri untuk produk ini sebelum bisa disimpan.
            </p>
          )}

          <Input
            label="Shade / Variant (Optional)"
            placeholder="e.g. 220 Warm Peach"
            value={shade}
            onChange={(e) => setShade(e.target.value)}
          />

          <Input
            label="Product Photo URL"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <Input
            label="Creator's Personal Note"
            placeholder="Why you love & recommend this product..."
            value={affiliatorNote}
            onChange={(e) => setAffiliatorNote(e.target.value)}
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100">
            <Button type="button" onClick={() => setIsAddOpen(false)} variant="ghost">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!selectedProductId || !affiliateUrl.trim()}>
              Save Product & Enable Match
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT PRODUCT MODAL */}
      <Modal
        isOpen={editingProduct !== null}
        onClose={() => setEditingProduct(null)}
        title="Edit Affiliate Listing"
        description={editingProduct ? `${editingProduct.brand} — ${editingProduct.name}` : undefined}
        maxWidth="lg"
      >
        {editingProduct && (
          <form onSubmit={handleSaveEditProduct} className="space-y-4 pt-2">
            <p className="text-[11px] text-zinc-500 bg-zinc-50 border border-zinc-100 rounded-xl p-3">
              Nama, brand, kategori, dan foto produk mengikuti data Master Catalog dan tidak bisa diubah di sini — hanya detail listing kamu yang bisa disesuaikan.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Harga (Rp)"
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                required
              />
              <Input
                label="Shade"
                placeholder="e.g. Medium Warm 220"
                value={editShade}
                onChange={(e) => setEditShade(e.target.value)}
              />
            </div>

            <Input
              label="Affiliate URL"
              type="url"
              value={editAffiliateUrl}
              onChange={(e) => setEditAffiliateUrl(e.target.value)}
              required
            />

            <Select
              label="Status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as Product['status'])}
              options={[
                { label: 'Active', value: 'Active' },
                { label: 'Draft', value: 'Draft' },
                { label: 'Out of Stock', value: 'Out of Stock' },
              ]}
            />

            <Input
              label="Catatan Affiliator"
              placeholder="Why you love & recommend this product..."
              value={editAffiliatorNote}
              onChange={(e) => setEditAffiliatorNote(e.target.value)}
            />

            <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100">
              <Button type="button" onClick={() => setEditingProduct(null)} variant="ghost">
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <Modal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        title="Confirm Delete"
        description="Are you sure you want to delete this affiliate product from your AI page?"
      >
        <div className="pt-4 flex justify-end gap-3">
          <Button onClick={() => setDeletingId(null)} variant="ghost">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (deletingId) onDeleteProduct(deletingId);
              setDeletingId(null);
            }}
            variant="danger"
          >
            Delete Product
          </Button>
        </div>
      </Modal>

    </div>
  );
};
