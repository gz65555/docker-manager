import { AppImageTable } from "@/components/app-image-table";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { listImages } from "@/lib/docker-service";

// Server-side code for debugging only
// This will be removed in production as we're using the API endpoint
const images = await listImages();

// Debug log to see image structure
images.forEach((image) => {
  console.log(image.Id);
  console.log(image.RepoTags);
  console.log(image.Created);
  console.log(image.Size);
});

export default async function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Images</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Images</h1>
          </div>
          <div className="w-full overflow-hidden">
            <AppImageTable />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
} 