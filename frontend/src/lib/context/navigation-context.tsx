'use client';

import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Navigation, NavigationItem } from '../types/navigation';
import { SITE_NAVIGATION } from '../constants';

interface NavigationState {
  isCollapsed: boolean;
  activeItemId: string | null;
  navigations: Navigation[];
  isLoading: boolean;
}

type Action =
  | { type: 'TOGGLE_COLLAPSED' }
  | { type: 'SET_COLLAPSED'; payload: boolean }
  | { type: 'SET_ACTIVE_ITEM'; payload: string | null }
  | { type: 'SET_NAVIGATIONS'; payload: Navigation[] }
  | { type: 'ADD_NAVIGATION'; payload: Navigation }
  | { type: 'REMOVE_NAVIGATION'; payload: string }
  | { type: 'TOGGLE_NAVIGATION_VISIBILITY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };


function reducer(state: NavigationState, action: Action): NavigationState {
  switch (action.type) {
    case 'TOGGLE_COLLAPSED':
      return { ...state, isCollapsed: !state.isCollapsed };
    case 'SET_COLLAPSED':
      return { ...state, isCollapsed: action.payload };
    case 'SET_ACTIVE_ITEM':
      return { ...state, activeItemId: action.payload };
    case 'SET_NAVIGATIONS':
      return { ...state, navigations: action.payload };
    case 'ADD_NAVIGATION':
      return { ...state, navigations: [...state.navigations, action.payload] };
    case 'REMOVE_NAVIGATION':
      return {
        ...state,
        navigations: state.navigations.filter(n => n.id !== action.payload),
      };
    case 'TOGGLE_NAVIGATION_VISIBILITY':
      return {
        ...state,
        navigations: state.navigations.map(nav =>
          nav.id === action.payload
            ? { ...nav, isVisible: !nav.isVisible }
            : nav
        ),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface NavigationContextType extends NavigationState {
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setActiveItem: (id: string | null) => void;
  setNavigations: (navigations: Navigation[]) => void;
  addNavigation: (navigation: Navigation) => void;
  removeNavigation: (navigationId: string) => void;
  toggleNavigation: (navigationId: string) => void;

  navigateTo: (href: string, replace?: boolean) => void;
  goBack: () => void;
  goForward: () => void;
  refresh: () => void;

  isActiveRoute: (href: string) => boolean;
  getActiveItem: (items: NavigationItem[]) => NavigationItem | null;
  getNavigation: (navigationId: string) => Navigation | null;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

const defaultState: NavigationState = {
  isCollapsed: false,
  activeItemId: null,
  navigations: [SITE_NAVIGATION],
  isLoading: false,
};

export const NavigationProvider = ({ children, initialState = defaultState }: { children: ReactNode, initialState?: NavigationState }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [state, dispatch] = useReducer(reducer, initialState);

  const toggleCollapsed = useCallback(() => {
    dispatch({ type: 'TOGGLE_COLLAPSED' });
  }, []);

  const setCollapsed = useCallback((collapsed: boolean) => {
    dispatch({ type: 'SET_COLLAPSED', payload: collapsed });
  }, []);

  const setActiveItem = useCallback((id: string | null) => {
    dispatch({ type: 'SET_ACTIVE_ITEM', payload: id });
  }, []);

  const setNavigations = useCallback((navigations: Navigation[]) => {
    dispatch({ type: 'SET_NAVIGATIONS', payload: navigations });
  }, []);

  const addNavigation = useCallback((navigation: Navigation) => {
    dispatch({ type: 'ADD_NAVIGATION', payload: navigation });
  }, []);

  const removeNavigation = useCallback((navigationId: string) => {
    dispatch({ type: 'REMOVE_NAVIGATION', payload: navigationId });
  }, []);

  const toggleNavigation = useCallback((navigationId: string) => {
    dispatch({ type: 'TOGGLE_NAVIGATION_VISIBILITY', payload: navigationId });
  }, []);

  const navigateTo = useCallback(
    (href: string, replace = false) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      if (replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
      // Slight delay to allow navigation to settle; could be improved with router events
      setTimeout(() => {
        dispatch({ type: 'SET_LOADING', payload: false });
      }, 100);
    },
    [router]
  );

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const goForward = useCallback(() => {
    router.forward();
  }, [router]);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const isActiveRoute = useCallback(
    (href: string) => {
      if (href === '/') return pathname === '/';
      return pathname.startsWith(href);
    },
    [pathname]
  );

  const getActiveItem = useCallback(
    (items: NavigationItem[]): NavigationItem | null => {
      for (const item of items) {
        if (item.href && isActiveRoute(item.href)) return item;
        if (item.children) {
          const child = getActiveItem(item.children);
          if (child) return child;
        }
      }
      return null;
    },
    [isActiveRoute]
  );

  const getNavigation = useCallback(
    (navigationId: string): Navigation | null => {
      return state.navigations.find(n => n.id === navigationId) || null;
    },
    [state.navigations]
  );

  const contextValue = useMemo<NavigationContextType>(
    () => ({
      ...state,
      toggleCollapsed,
      setCollapsed,
      setActiveItem,
      setNavigations,
      addNavigation,
      removeNavigation,
      toggleNavigation,
      navigateTo,
      goBack,
      goForward,
      refresh,
      isActiveRoute,
      getActiveItem,
      getNavigation,
    }),
    [
      state,
      toggleCollapsed,
      setCollapsed,
      setActiveItem,
      setNavigations,
      addNavigation,
      removeNavigation,
      toggleNavigation,
      navigateTo,
      goBack,
      goForward,
      refresh,
      isActiveRoute,
      getActiveItem,
      getNavigation,
    ]
  );

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error(
      'useNavigation must be used within a NavigationProvider'
    );
  }
  return context;
};

export const useNavigationItems = (items: NavigationItem[]) => {
  const { getActiveItem, isActiveRoute } = useNavigation();

  const activeItem = getActiveItem(items);

  const enhancedItems = useMemo(
    () =>
      items.map(item => ({
        ...item,
        isActive: item.href ? isActiveRoute(item.href) : false,
        children: item.children?.map(child => ({
          ...child,
          isActive: child.href ? isActiveRoute(child.href) : false,
        })),
      })),
    [items, isActiveRoute]
  );

  return {
    items: enhancedItems,
    activeItem,
  };
};

export const useNavigationById = (navigationId: string) => {
  const {
    navigations,
    getNavigation,
    addNavigation,
    removeNavigation,
    toggleNavigation,
  } = useNavigation();

  const navigation = getNavigation(navigationId);
  const isVisible = navigation?.isVisible ?? true;

  return {
    navigation,
    isVisible,
    exists: !!navigation,
    addNavigation,
    removeNavigation: () => removeNavigation(navigationId),
    toggleVisibility: () => toggleNavigation(navigationId),
    allNavigations: navigations,
  };
};
