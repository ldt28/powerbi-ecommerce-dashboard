import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface Channel {
  id: string;
  name: string;
  icon: string;
}

const channels: Channel[] = [
  { id: "amazon", name: "Amazon", icon: "🛒" },
  { id: "ebay", name: "eBay", icon: "📱" },
  { id: "walmart", name: "Walmart", icon: "🏪" },
  { id: "webstores", name: "WebStores", icon: "🌐" },
  { id: "tractorSupply", name: "Tractor Supply", icon: "🚜" },
  { id: "autozone", name: "AutoZone", icon: "🔧" },
  { id: "northernTool", name: "Northern Tool", icon: "🛠️" },
  { id: "lowes", name: "Lowe's", icon: "🏗️" },
];

interface ChannelNavigationProps {
  activeChannel?: string;
}

export function ChannelNavigation({ activeChannel }: ChannelNavigationProps) {
  return (
    <div className="w-full bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-800 light:from-slate-100 light:to-slate-50 border-b border-slate-700 dark:border-slate-700 light:border-slate-200 py-4 px-6 mb-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-sm font-semibold text-slate-400 dark:text-slate-400 light:text-slate-700 mb-4 uppercase tracking-wide">Quick Access Channels</h2>
        <div className="flex flex-wrap gap-2">
          {channels.map((channel) => (
            <Link key={channel.id} href={`/dashboard/store/${channel.id}`}>
              <Button
                variant={activeChannel === channel.id ? "default" : "outline"}
                size="sm"
                className={`flex items-center gap-2 text-white dark:text-white light:text-slate-900 ${
                  activeChannel === channel.id
                    ? "bg-blue-600 hover:bg-blue-700 border-blue-600"
                    : "border-slate-600 dark:border-slate-600 light:border-slate-300 hover:border-slate-500 dark:hover:border-slate-500 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200"
                }`}
              >
                <span className="text-base">{channel.icon}</span>
                <span>{channel.name}</span>
                <ChevronRight className="w-3 h-3 opacity-50" />
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
