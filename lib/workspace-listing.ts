export type WorkspaceListing = {
  message?: string;
  items: Array<{ title: string; href: string; description?: string; publishedAt?: string | null; external?: boolean; sample?: boolean; anchor?: string }>;
  href: string;
  label: string;
};
