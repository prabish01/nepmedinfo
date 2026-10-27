import { entryRoute } from "@/lib/entry-route";

const route = entryRoute("drug");

export const revalidate = 3600;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
