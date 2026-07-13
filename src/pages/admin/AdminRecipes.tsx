import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ChefHat, Plus, Trash2, Loader2 } from 'lucide-react';

interface Recipe { id: string; product_id: string; name: string; yield_qty: number; notes: string | null; }
interface RecipeItem { id: string; recipe_id: string; ingredient_name: string; unit: string; quantity: number; unit_cost: number; }
interface Product { id: string; name: string; }

export default function AdminRecipes() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [items, setItems] = useState<Record<string, RecipeItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ product_id: '', name: '', yield_qty: 1, notes: '' });

  const load = async () => {
    setLoading(true);
    const [{ data: rs }, { data: ps }] = await Promise.all([
      supabase.from('recipes' as any).select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('id,name').eq('status', 'active').limit(200),
    ]);
    const list = (rs ?? []) as any as Recipe[];
    setRecipes(list);
    setProducts((ps ?? []) as any);
    if (list.length) {
      const { data: its } = await supabase.from('recipe_items' as any).select('*').in('recipe_id', list.map(r => r.id));
      const grouped: Record<string, RecipeItem[]> = {};
      (its as any as RecipeItem[] ?? []).forEach(i => { (grouped[i.recipe_id] ||= []).push(i); });
      setItems(grouped);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.product_id || !form.name) return toast.error('เลือกสินค้าและตั้งชื่อสูตร');
    const { error } = await supabase.from('recipes' as any).insert(form as any);
    if (error) return toast.error(error.message);
    setForm({ product_id: '', name: '', yield_qty: 1, notes: '' });
    load();
  };

  const addItem = async (recipe_id: string) => {
    const { error } = await supabase.from('recipe_items' as any).insert({ recipe_id, ingredient_name: 'วัตถุดิบใหม่', unit: 'g', quantity: 0, unit_cost: 0 } as any);
    if (error) return toast.error(error.message);
    load();
  };

  const updateItem = async (id: string, patch: Partial<RecipeItem>) => {
    const { error } = await supabase.from('recipe_items' as any).update(patch as any).eq('id', id);
    if (error) return toast.error(error.message);
  };

  const removeItem = async (id: string) => {
    await supabase.from('recipe_items' as any).delete().eq('id', id);
    load();
  };

  const removeRecipe = async (id: string) => {
    await supabase.from('recipes' as any).delete().eq('id', id);
    load();
  };

  const cost = (rid: string) => (items[rid] ?? []).reduce((s, i) => s + i.quantity * i.unit_cost, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-2"><ChefHat className="h-7 w-7" /> สูตรอาหาร (BOM)</h1>
        <p className="text-muted-foreground mt-1">คำนวณต้นทุนวัตถุดิบต่อสินค้า</p>
      </div>

      <Card className="glass border-border/50">
        <CardHeader><CardTitle>สร้างสูตรใหม่</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <select className="rounded-md bg-background border border-border px-3 py-2 text-sm md:col-span-2" value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })}>
            <option value="">เลือกสินค้า…</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <Input placeholder="ชื่อสูตร" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input type="number" placeholder="Yield" value={form.yield_qty} onChange={(e) => setForm({ ...form, yield_qty: Number(e.target.value) })} />
          <Button onClick={create}><Plus className="h-4 w-4 mr-2" /> สร้าง</Button>
          <Textarea placeholder="โน้ต" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="md:col-span-5" />
        </CardContent>
      </Card>

      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : recipes.map(r => (
        <Card key={r.id} className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{r.name}</CardTitle>
              <div className="text-xs text-muted-foreground">{products.find(p => p.id === r.product_id)?.name} · yield {r.yield_qty} · ต้นทุนรวม ฿{cost(r.id).toFixed(2)} (ต่อหน่วย ฿{(cost(r.id) / (r.yield_qty || 1)).toFixed(2)})</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => addItem(r.id)}><Plus className="h-4 w-4 mr-1" /> วัตถุดิบ</Button>
              <Button size="sm" variant="ghost" onClick={() => removeRecipe(r.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {(items[r.id] ?? []).map(i => (
              <div key={i.id} className="grid grid-cols-12 gap-2 items-center">
                <Input className="col-span-4" defaultValue={i.ingredient_name} onBlur={(e) => updateItem(i.id, { ingredient_name: e.target.value })} />
                <Input className="col-span-2" defaultValue={i.unit} onBlur={(e) => updateItem(i.id, { unit: e.target.value })} />
                <Input className="col-span-2" type="number" defaultValue={i.quantity} onBlur={(e) => updateItem(i.id, { quantity: Number(e.target.value) })} />
                <Input className="col-span-2" type="number" defaultValue={i.unit_cost} onBlur={(e) => updateItem(i.id, { unit_cost: Number(e.target.value) })} />
                <div className="col-span-1 text-sm text-muted-foreground">฿{(i.quantity * i.unit_cost).toFixed(2)}</div>
                <Button className="col-span-1" size="icon" variant="ghost" onClick={() => removeItem(i.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            {!(items[r.id] ?? []).length && <div className="text-xs text-muted-foreground">ยังไม่มีวัตถุดิบ</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
