import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export function CustomerForm() {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="default" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Customer
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to manage their credits and loyalty points.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue="Nalin Perera" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Username</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue="nalinperera@gmail.com"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="phone">Contact No.</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue="0777123456"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                type="tel"
                defaultValue="0777123456"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
