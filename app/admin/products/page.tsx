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
import { ProductType, CategoryType } from '@/app/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from 'sonner';
import Image from 'next/image';
import { productsApi } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    stock: 0,
    category: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Create a map of category IDs to names when categories are loaded
  useEffect(() => {
    const map: Record<string, string> = {};
    categories.forEach(category => {
      map[category._id] = category.name;
    });
    setCategoryMap(map);
  }, [categories]);

  const fetchProducts = async () => {
    try {
      setIsLoadingData(true);
      const data = await productsApi.getAll();
      // Ensure data is an array before setting state
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error fetching products');
      // Initialize with empty array on error
      setProducts([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await productsApi.getCategories();
      // Ensure data is an array before setting state
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error fetching categories');
      // Initialize with empty array on error
      setCategories([]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('price', newProduct.price.toString());
      formData.append('stock', newProduct.stock.toString());
      formData.append('category', newProduct.category);

      if (selectedImage) {
        formData.append('photo', selectedImage);
      }

      const response = await productsApi.create(formData);

      if (response.ok) {
        toast.success('Product created successfully');
        setIsDialogOpen(false);
        fetchProducts();
        setNewProduct({
          name: '',
          price: 0,
          stock: 0,
          category: '',
        });
        setSelectedImage(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error creating product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Error creating product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await productsApi.delete(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

  // Get category name from category ID
  const getCategoryName = (categoryId: string) => {
    return categoryMap[categoryId] || 'Unknown Category';
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
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
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
                type="number"
                placeholder="Stock"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                required
                disabled={isLoading}
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <Select 
                  value={newProduct.category} 
                  onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Product Image
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Upload className="w-4 h-4 text-gray-500" />
                </div>
                {selectedImage && (
                  <div className="text-sm text-gray-500">
                    Selected: {selectedImage.name}
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

      {isLoadingData ? (
        <div className="flex justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading products...</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      {product.photo ? (
                        <div className="relative w-12 h-12">
                          <Image
                            src={product.photo}
                            alt={product.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">No image</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{product._id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.stock || 'N/A'}</TableCell>
                    <TableCell>{getCategoryName(product.category)}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}