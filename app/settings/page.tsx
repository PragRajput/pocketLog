import { getCategories } from "@/lib/actions";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryManager } from "@/components/categories/category-manager";

export default async function SettingsPage() {
  const categories = await getCategories();

  return (
    <div>
      <Header title="Settings" description="Manage categories and app preferences" />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Expense Categories</CardTitle>
          <p className="text-xs text-gray-400">
            Add your own or remove ones you don't use. Categories help organise expenses in reports.
          </p>
        </CardHeader>
        <CardContent>
          <CategoryManager categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
