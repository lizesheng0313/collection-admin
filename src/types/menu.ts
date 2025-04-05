export interface Menus {
    id: string;
    pid?: string;
    icon?: string;
    index: string;
    title: string;
    children?: Menus[];
}