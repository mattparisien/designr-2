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
import { Navigation, NavigationItem, NavigationSection } from '../types/navigation';
import { APP_NAVIGATION } from '../constants';

interface NavigationState {
  isCollapsed: boolean;
  activeItemId: string | null;
  navigation: Navigation | null;
  isLoading: boolean;
}

type Action =
  | { type: 'TOGGLE_COLLAPSED' }
  | { type: 'SET_COLLAPSED'; payload: boolean }
  | { type: 'SET_ACTIVE_ITEM'; payload: string | null }
  | { type: 'SET_NAVIGATION'; payload: Navigation | null }
  | { type: 'ADD_NAVIGATION_SECTION'; payload: NavigationSection }
  | { type: 'REMOVE_NAVIGATION_SECTION'; payload: string }
  | { type: 'TOGGLE_NAVIGATION_VISIBILITY' }
  | { type: 'SET_LOADING'; payload: boolean };


function reducer(state: NavigationState, action: Action): NavigationState {
  switch (action.type) {
    case 'TOGGLE_COLLAPSED':
      return { ...state, isCollapsed: !state.isCollapsed };
    case 'SET_COLLAPSED':
      return { ...state, isCollapsed: action.payload };
    case 'SET_ACTIVE_ITEM':
      return { ...state, activeItemId: action.payload };
    case 'SET_NAVIGATION':
      return { ...state, navigation: action.payload };
    case 'ADD_NAVIGATION_SECTION':
      return {
        ...state,
        navigation: state.navigation 
          ? { 
              ...state.navigation, 
              sections: [...state.navigation.sections, action.payload] 
            }
          : null
      };
    case 'REMOVE_NAVIGATION_SECTION':
      return {
        ...state,
        navigation: state.navigation 
          ? { 
              ...state.navigation, 
              sections: state.navigation.sections.filter(section => section.id !== action.payload)
            }
          : null
      };
    case 'TOGGLE_NAVIGATION_VISIBILITY':
      return {
        ...state,
        navigation: state.navigation 
          ? { ...state.navigation, isVisible: !state.navigation.isVisible }
          : null
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
  setNavigation: (navigation: Navigation | null) => void;
  addNavigationSection: (section: NavigationSection) => void;
  removeNavigationSection: (sectionId: string) => void;
  toggleNavigationVisibility: () => void;

  navigateTo: (href: string, replace?: boolean) => void;
  goBack: () => void;
  goForward: () => void;
  refresh: () => void;

  isActiveRoute: (href: string) => boolean;
  getActiveItem: (items: NavigationItem[]) => NavigationItem | null;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

const defaultState: NavigationState = {
  isCollapsed: false,
  activeItemId: null,
  navigation: APP_NAVIGATION,
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

  const setNavigation = useCallback((navigation: Navigation | null) => {
    dispatch({ type: 'SET_NAVIGATION', payload: navigation });
  }, []);

  const addNavigationSection = useCallback((section: NavigationSection) => {
    dispatch({ type: 'ADD_NAVIGATION_SECTION', payload: section });
  }, []);

  const removeNavigationSection = useCallback((sectionId: string) => {
    dispatch({ type: 'REMOVE_NAVIGATION_SECTION', payload: sectionId });
  }, []);

  const toggleNavigationVisibility = useCallback(() => {
    dispatch({ type: 'TOGGLE_NAVIGATION_VISIBILITY' });
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

  const contextValue = useMemo<NavigationContextType>(
    () => ({
      ...state,
      toggleCollapsed,
      setCollapsed,
      setActiveItem,
      setNavigation,
      addNavigationSection,
      removeNavigationSection,
      toggleNavigationVisibility,
      navigateTo,
      goBack,
      goForward,
      refresh,
      isActiveRoute,
      getActiveItem,
    }),
    [
      state,
      toggleCollapsed,
      setCollapsed,
      setActiveItem,
      setNavigation,
      addNavigationSection,
      removeNavigationSection,
      toggleNavigationVisibility,
      navigateTo,
      goBack,
      goForward,
      refresh,
      isActiveRoute,
      getActiveItem,
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

export const useCurrentNavigation = () => {
  const {
    navigation,
    setNavigation,
    addNavigationSection,
    removeNavigationSection,
    toggleNavigationVisibility,
  } = useNavigation();

  const isVisible = navigation?.isVisible ?? true;

  return {
    navigation,
    isVisible,
    exists: !!navigation,
    setNavigation,
    addSection: addNavigationSection,
    removeSection: removeNavigationSection,
    toggleVisibility: toggleNavigationVisibility,
  };
};
