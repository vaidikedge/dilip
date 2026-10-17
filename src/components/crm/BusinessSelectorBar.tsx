import React from 'react';
import {
  Sun,
  Zap,
  Wind,
  Building2,
  Car,
  Laptop,
  Package,
  Wrench,
  Shield,
  Heart,
  Store,
  Briefcase,
  Truck,
  Plus,
  Settings,
  Layers,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { BusinessWorkspace } from '../../data/businessTemplatesData';
import { CrmTask } from '../../data/crmData';

interface BusinessSelectorBarProps {
  businesses?: BusinessWorkspace[];
  activeBusinessId: string;
  onSelectBusiness: (businessId: string) => void;
  onOpenAddBusiness?: () => void;
  onOpenManageBusiness?: () => void;
  onAddBusinessClick?: () => void;
  onManageBusinessClick?: () => void;
  tasks?: CrmTask[];
  tasksCountByBusiness?: Record<string, number>;
  isAllBusinessesView?: boolean;
  onToggleAllBusinessesView?: (value?: boolean) => void;
  isOwner?: boolean;
}

export const renderBusinessIcon = (iconName: string, className: string = 'w-4 h-4') => {
  switch (iconName) {
    case 'Sun':
      return <Sun className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Wind':
      return <Wind className={className} />;
    case 'Building2':
    case 'Building':
      return <Building2 className={className} />;
    case 'Car':
      return <Car className={className} />;
    case 'Laptop':
      return <Laptop className={className} />;
    case 'Package':
      return <Package className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'Shield':
      return <Shield className={className} />;
    case 'Heart':
      return <Heart className={className} />;
    case 'Store':
      return <Store className={className} />;
    case 'Truck':
      return <Truck className={className} />;
    default:
      return <Briefcase className={className} />;
  }
};

export const getThemeStyles = (theme: BusinessWorkspace['colorTheme']) => {
  switch (theme) {
    case 'blue':
      return {
        activeBorder: 'border-blue-500',
        activeBg: 'bg-blue-500/10 text-blue-300',
        badgeBg: 'bg-blue-950/80 text-blue-300 border-blue-500/40',
        indicator: 'bg-blue-400',
        gradient: 'from-blue-600 to-indigo-600',
        chipActive: 'bg-blue-600 text-white shadow-blue-500/30',
        chipInactive: 'text-blue-200 hover:bg-blue-900/40',
        accentText: 'text-blue-400',
      };
    case 'emerald':
      return {
        activeBorder: 'border-emerald-500',
        activeBg: 'bg-emerald-500/10 text-emerald-300',
        badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
        indicator: 'bg-emerald-400',
        gradient: 'from-emerald-600 to-teal-600',
        chipActive: 'bg-emerald-600 text-white shadow-emerald-500/30',
        chipInactive: 'text-emerald-200 hover:bg-emerald-900/40',
        accentText: 'text-emerald-400',
      };
    case 'cyan':
      return {
        activeBorder: 'border-cyan-500',
        activeBg: 'bg-cyan-500/10 text-cyan-300',
        badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
        indicator: 'bg-cyan-400',
        gradient: 'from-cyan-600 to-blue-600',
        chipActive: 'bg-cyan-600 text-white shadow-cyan-500/30',
        chipInactive: 'text-cyan-200 hover:bg-cyan-900/40',
        accentText: 'text-cyan-400',
      };
    case 'violet':
      return {
        activeBorder: 'border-violet-500',
        activeBg: 'bg-violet-500/10 text-violet-300',
        badgeBg: 'bg-violet-950/80 text-violet-300 border-violet-500/40',
        indicator: 'bg-violet-400',
        gradient: 'from-violet-600 to-purple-600',
        chipActive: 'bg-violet-600 text-white shadow-violet-500/30',
        chipInactive: 'text-violet-200 hover:bg-violet-900/40',
        accentText: 'text-violet-400',
      };
    case 'rose':
      return {
        activeBorder: 'border-rose-500',
        activeBg: 'bg-rose-500/10 text-rose-300',
        badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
        indicator: 'bg-rose-400',
        gradient: 'from-rose-600 to-pink-600',
        chipActive: 'bg-rose-600 text-white shadow-rose-500/30',
        chipInactive: 'text-rose-200 hover:bg-rose-900/40',
        accentText: 'text-rose-400',
      };
    case 'orange':
      return {
        activeBorder: 'border-orange-500',
        activeBg: 'bg-orange-500/10 text-orange-300',
        badgeBg: 'bg-orange-950/80 text-orange-300 border-orange-500/40',
        indicator: 'bg-orange-400',
        gradient: 'from-orange-600 to-amber-600',
        chipActive: 'bg-orange-600 text-white shadow-orange-500/30',
        chipInactive: 'text-orange-200 hover:bg-orange-900/40',
        accentText: 'text-orange-400',
      };
    case 'indigo':
      return {
        activeBorder: 'border-indigo-500',
        activeBg: 'bg-indigo-500/10 text-indigo-300',
        badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40',
        indicator: 'bg-indigo-400',
        gradient: 'from-indigo-600 to-slate-800',
        chipActive: 'bg-indigo-600 text-white shadow-indigo-500/30',
        chipInactive: 'text-indigo-200 hover:bg-indigo-900/40',
        accentText: 'text-indigo-400',
      };
    case 'amber':
    default:
      return {
        activeBorder: 'border-amber-500',
        activeBg: 'bg-amber-500/10 text-amber-300',
        badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
        indicator: 'bg-amber-400',
        gradient: 'from-amber-500 to-amber-600',
        chipActive: 'bg-amber-400 text-slate-950 shadow-amber-500/30',
        chipInactive: 'text-slate-300 hover:bg-white/10',
        accentText: 'text-amber-400',
      };
  }
};

export const BusinessSelectorBar: React.FC<BusinessSelectorBarProps> = ({
  businesses = [],
  activeBusinessId,
  onSelectBusiness,
  onOpenAddBusiness,
  onOpenManageBusiness,
  onAddBusinessClick,
  onManageBusinessClick,
  tasks = [],
  tasksCountByBusiness,
  isAllBusinessesView = false,
  onToggleAllBusinessesView,
  isOwner = true,
}) => {
  const safeBusinesses = Array.isArray(businesses) ? businesses : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const activeBusiness =
    safeBusinesses.find((b) => b.id === activeBusinessId) || safeBusinesses[0] || null;

  const currentTheme = activeBusiness ? getThemeStyles(activeBusiness.colorTheme) : getThemeStyles('amber');

  const handleOpenAdd = onOpenAddBusiness || onAddBusinessClick || (() => {});
  const handleOpenManage = onOpenManageBusiness || onManageBusinessClick || (() => {});
  const handleToggleAll = () => {
    if (typeof onToggleAllBusinessesView === 'function') {
      onToggleAllBusinessesView(!isAllBusinessesView);
    }
  };

  // Count tasks per business safely
  const getTaskCountForBiz = (bizId: string) => {
    if (tasksCountByBusiness && typeof tasksCountByBusiness[bizId] === 'number') {
      return tasksCountByBusiness[bizId];
    }
    return safeTasks.filter((t) => (t?.businessId || 'biz-solar-dilip') === bizId).length;
  };

  const activeBizTasks = safeTasks.filter(
    (t) => (t?.businessId || 'biz-solar-dilip') === (activeBusiness?.id || 'biz-solar-dilip')
  );

  const activeBizValue = activeBizTasks.reduce((acc, t) => acc + (t?.dealValueRs || 0), 0);

  return (
    <section
      id="crm-business-template-selector"
      className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-xl text-white space-y-3 transition-all"
    >
      {/* Top Row: Section Tag & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black tracking-tight text-white uppercase">
                Business Workspaces & Templates
              </span>
              <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                Multi-Business Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Switch or create enterprise templates for any industry with custom stages and isolated pipelines.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Consolidated View Toggle - Only when multiple businesses exist */}
          {businesses.length > 1 && (
            <button
              type="button"
              onClick={handleToggleAll}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isAllBusinessesView
                  ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Toggle between single business pipeline and all combined businesses"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isAllBusinessesView ? 'Showing All Businesses' : 'View All Combined'}</span>
            </button>
          )}

          {/* Manage Active Business (Owner only) */}
          {isOwner && activeBusiness && (
            <button
              type="button"
              onClick={handleOpenManage}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              title="Edit workflow stages, contact info, and system types of this business"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Manage Business</span>
            </button>
          )}

          {/* Add Business button (For future expansion) */}
          {isOwner && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-md hover:shadow-amber-500/20 transition-all cursor-pointer transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add Business</span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Business Chips Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
        {businesses.map((biz) => {
          const isCurrentActive = biz.id === activeBusinessId && !isAllBusinessesView;
          const bizTheme = getThemeStyles(biz.colorTheme);
          const taskCount = getTaskCountForBiz(biz.id);

          return (
            <button
              key={biz.id}
              type="button"
              onClick={() => {
                onToggleAllBusinessesView(false);
                onSelectBusiness(biz.id);
              }}
              className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                isCurrentActive
                  ? `${bizTheme.chipActive} border-transparent shadow-lg font-bold scale-[1.02]`
                  : `bg-slate-800/70 border-slate-700/80 ${bizTheme.chipInactive} hover:border-slate-600`
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  isCurrentActive ? 'bg-black/20 text-current' : 'bg-slate-700/80 text-amber-400'
                }`}
              >
                {renderBusinessIcon(biz.iconName, 'w-3.5 h-3.5')}
              </div>

              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">{biz.name}</span>
                  {biz.isDefault && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        isCurrentActive ? 'bg-black/30 text-white' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      Primary
                    </span>
                  )}
                </div>
                <div className="text-[10px] opacity-80 flex items-center gap-1.5">
                  <span>{biz.industry}</span>
                  <span>•</span>
                  <span className="font-mono font-bold">
                    {taskCount} {taskCount === 1 ? 'Project' : 'Projects'}
                  </span>
                </div>
              </div>

              {isCurrentActive && (
                <span className="ml-1 w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </button>
          );
        })}

        {/* Add Business Quick Tile */}
        {isOwner && (
          <button
            type="button"
            onClick={onOpenAddBusiness}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-dashed border-slate-600 text-slate-400 hover:text-amber-300 hover:border-amber-400/60 hover:bg-slate-800/50 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Template</span>
          </button>
        )}
      </div>

      {/* Active Business Live Briefing Strip */}
      {activeBusiness && !isAllBusinessesView && (
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-lg ${currentTheme.badgeBg} border shrink-0`}>
              {renderBusinessIcon(activeBusiness.iconName, 'w-5 h-5')}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-sm text-white">{activeBusiness.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentTheme.badgeBg}`}>
                  {activeBusiness.badge}
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Category: <strong className="text-slate-200">{activeBusiness.category}</strong>
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate mt-0.5">
                {activeBusiness.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-slate-300">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                Active Projects
              </span>
              <span className="font-mono font-bold text-sm text-white">
                {activeBizTasks.length} Sites
              </span>
            </div>

            <div className="h-7 w-px bg-slate-800" />

            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                Pipeline Value
              </span>
              <span className={`font-mono font-bold text-sm ${currentTheme.accentText}`}>
                {activeBusiness.currency}
                {activeBizValue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="h-7 w-px bg-slate-800" />

            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                Workflow Steps
              </span>
              <span className="font-mono font-bold text-sm text-emerald-400">
                {activeBusiness.stages?.length || 8} Stages
              </span>
            </div>
          </div>
        </div>
      )}

      {isAllBusinessesView && (
        <div className="bg-purple-950/40 border border-purple-500/40 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-3 text-xs text-purple-200">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              <strong>Consolidated Multi-Business Mode Active:</strong> Showing aggregated projects, tasks, and financials across all <strong>{businesses.length} registered business workspaces</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onToggleAllBusinessesView(false)}
            className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1 rounded-lg cursor-pointer shrink-0"
          >
            Switch to Single Workspace
          </button>
        </div>
      )}
    </section>
  );
};
