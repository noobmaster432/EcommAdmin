'use client';

import { useState, useEffect } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ProductType } from '@/app/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from 'sonner';
import Image from 'next/image';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: 0,
    description: '',
    category: { id: 0, name: '', image: '' },
  });
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/products/all');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast.error('Error fetching products');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImages(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', newProduct.title);
      formData.append('price', newProduct.price.toString());
      formData.append('description', newProduct.description);
      formData.append('categoryId', newProduct.category.id.toString());

      if (selectedImages) {
        Array.from(selectedImages).forEach((image) => {
          formData.append('images', image);
        });
      }

      const response = await fetch('/products/new', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Product created successfully');
        setIsDialogOpen(false);
        fetchProducts();
        setNewProduct({
          title: '',
          price: 0,
          description: '',
          category: { id: 0, name: '', image: '' },
        });
        setSelectedImages(null);
      } else {
        toast.error('Error creating product');
      }
    } catch (error) {
      toast.error('Error creating product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        toast.error('Error deleting product');
      }
    } catch (error) {
      toast.error('Error deleting product');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Title"
                value={newProduct.title}
                onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                required
                disabled={isLoading}
              />
              <Input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                required
                disabled={isLoading}
              />
              <Input
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                required
                disabled={isLoading}
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Product Images
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Upload className="w-4 h-4 text-gray-500" />
                </div>
                {selectedImages && (
                  <div className="text-sm text-gray-500">
                    {selectedImages.length} file(s) selected
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Product'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.images[0] && (
                    <div className="relative w-12 h-12">
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.title}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.category.name}</TableCell>
                <TableCell>{product.rating}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}