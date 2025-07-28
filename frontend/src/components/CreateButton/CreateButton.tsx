"use client";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import type { SelectionConfig } from "@/lib/types/config";

interface CreateItemData {
  key?: string;
  label?: string;
  description?: string;
  category?: string;
  data?: {
    files?: FileList;
  };
}

interface CreateButtonProps {
  /** Configuration for the creation options */
  config: SelectionConfig;
  /** Whether creation is currently in progress */
  isCreating?: boolean;
  /** Handler for creating items */
  onCreate: (item: CreateItemData) => void;
  /** Optional call-to-action configuration */
  cta?: {
    el?: string;
    label?: string;
    icon?: React.ComponentType<{ className?: string }>;
  };
}

export function CreateButton({ 
  config, 
  isCreating = false, 
  onCreate, 
  cta 
}: CreateButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {cta?.el === "input[type='file']" ? (
          <label className="flex items-center justify-center cursor-pointer hover:bg-neutral-200 px-2.5 py-1.5 rounded-lg gap-1">
            <span className="text-lg">
              {isCreating ? "Creating..." : cta?.label || "Create"}
            </span>
            {(cta?.icon && (
              <cta.icon className="text-neutral-400 w-5 h-5 mt-[3px]" />
            )) || <ChevronDown className="text-neutral-400 w-5 h-5 mt-[3px]" />}
            <input
              type="file"
              className="hidden"
              disabled={isCreating}
              onChange={(e) =>
                e.target.files &&
                onCreate({
                  data: {
                    files: e.target.files,
                  },
                })
              }
            />
          </label>
        ) : (
          <button
            className="flex items-center justify-center cursor-pointer hover:bg-neutral-200 px-2.5 py-1.5 rounded-lg gap-1"
            disabled={isCreating}
          >
            <span className="text-lg">
              {isCreating ? "Creating..." : cta?.label || "Create"}
            </span>
            {(cta?.icon && (
              <cta.icon className="text-neutral-400 w-5 h-5 mt-[3px]" />
            )) || <ChevronDown className="text-neutral-400 w-5 h-5 mt-[3px]" />}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="max-h-96 overflow-y-auto">
          {config.categories.map((category) => (
            <div key={category} className="p-3 border-b border-gray-100 last:border-b-0">
              <h3 className="text-sm font-medium text-neutral-500 mb-2 px-3">
                {category}
              </h3>
              <div className="space-y-1">
                {config.items
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <button
                      key={item.key}
                      onClick={() => onCreate(item)}
                      disabled={isCreating}
                      className="cursor-pointer w-full text-left px-3 py-2 rounded-md hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="font-medium text-[0.97rem] text-black">
                        {item.label}
                      </div>
                      {item.description && (
                        <div className="text-xs font-normal text-neutral-500">
                          {item.description}
                        </div>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
