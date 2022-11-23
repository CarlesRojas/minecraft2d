import { Global } from '@game/Controller';

interface InventoryManagerProps {
  global: Global;
  slots: number;
}

// TODO create a manager to handle Items
interface Item {
  name: string;
  ammount: number;
}

export default class InventoryManager {
  // GLOBAL
  private _global: Global;
  private _slots: (Item | null)[] = [];
  private _itemPositionInInventory: Record<string, number> = {};

  constructor({ global, slots }: InventoryManagerProps) {
    // GLOBAL
    this._global = global;
    this._slots = new Array(slots).fill(null);
  }

  add(item: Item) {
    const positionInInventory = this._itemPositionInInventory[item.name];
    const itemInInventory = this._slots[positionInInventory];

    if (itemInInventory) itemInInventory.ammount += item.ammount;
    else {
      const firstEmptySlot = this._slots.findIndex((slot) => !slot);
      this._slots[firstEmptySlot] = item;
      this._itemPositionInInventory[item.name] = firstEmptySlot;
    }

    return true;
  }

  remove(item: Item) {
    const positionInInventory = this._itemPositionInInventory[item.name];
    const itemInInventory = this._slots[positionInInventory];

    if (itemInInventory && itemInInventory.ammount >= item.ammount) {
      itemInInventory.ammount -= item.ammount;
      if (itemInInventory.ammount <= 0) {
        this._slots[positionInInventory] = null;
        delete this._itemPositionInInventory[item.name];
      }

      return true;
    }

    return false;
  }
}
