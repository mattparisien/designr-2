import { Design } from "./design";
import { DesignPage } from "./page";
export interface DesignProject extends Design {
    templateId?: string;
    ownerId?: string;
    pages: DesignPage[];
}
