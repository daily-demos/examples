import React, {
  useCallback,
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { useDeepCompareMemo } from 'use-deep-compare';

export const UIStateContext = createContext();

export const VIEW_MODE_GRID = 'grid';
export const VIEW_MODE_SPEAKER = 'speaker';
export const VIEW_MODE_MOBILE = 'mobile';

export const UIStateProvider = ({
  asides = [],
  modals = [],
  customTrayComponent,
  children,
}) => {
  const [pinnedId, setPinnedId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [preferredViewMode, setPreferredViewMode] = useState(VIEW_MODE_SPEAKER);
  const [viewMode, setViewMode] = useState(preferredViewMode);
  const [isShowingScreenshare, setIsShowingScreenshare] = useState(false);
  const [showParticipantsBar, setShowParticipantsBar] = useState(true);
  const [showAside, setShowAside] = useState();
  const [activeModals, setActiveModals] = useState({});
  const [customCapsule, setCustomCapsule] = useState();
  const [showAutoplayFailedModal, setShowAutoplayFailedModal] = useState(false);
  const [showDeviceInUseModal, setShowDeviceInUseModal] = useState(false);
  const [showDeviceNotFoundModal, setShowDeviceNotFoundModal] = useState(false);
  const [showUnblockPermissionsModal, setShowUnblockPermissionsModal] =
    useState(false);

  /**
   * Decide on view mode based on input conditions.
   */
  useEffect(() => {
    if (isMobile) {
      setViewMode(VIEW_MODE_MOBILE);
    } else if (pinnedId || isShowingScreenshare) {
      setViewMode(VIEW_MODE_SPEAKER);
    } else {
      setViewMode(preferredViewMode);
    }
  }, [pinnedId, isMobile, isShowingScreenshare, preferredViewMode]);

  const openModal = useCallback((modalName) => {
    setActiveModals((prevState) => ({
      ...prevState,
      [modalName]: true,
    }));
  }, []);

  const closeModal = useCallback((modalName) => {
    if (!modalName) {
      setActiveModals({});
    }

    setActiveModals((prevState) => ({
      ...prevState,
      [modalName]: false,
    }));
  }, []);

  const currentModals = useDeepCompareMemo(() => activeModals, [activeModals]);

  const toggleAside = useCallback((newAside) => {
    setShowAside((p) => (p === newAside ? null : newAside));
  }, []);

  const closeAside = useCallback(() => {
    setShowAside(null);
  }, []);

  useEffect(() => {
    if (pinnedId || isShowingScreenshare) {
      setViewMode(VIEW_MODE_SPEAKER);
    } else {
      setViewMode(preferredViewMode);
    }
  }, [isShowingScreenshare, pinnedId, preferredViewMode]);

  return (
    <UIStateContext.Provider
      value={{
        asides,
        modals,
        customTrayComponent,
        viewMode,
        openModal,
        closeModal,
        closeAside,
        showParticipantsBar,
        currentModals,
        toggleAside,
        pinnedId,
        showAside,
        setShowAside,
        setIsShowingScreenshare,
        setPreferredViewMode,
        setPinnedId,
        setShowParticipantsBar,
        customCapsule,
        setCustomCapsule,
        showAutoplayFailedModal,
        setShowAutoplayFailedModal,
        showDeviceInUseModal,
        setShowDeviceInUseModal,
        showDeviceNotFoundModal,
        setShowDeviceNotFoundModal,
        showUnblockPermissionsModal,
        setShowUnblockPermissionsModal,
        isMobile,
        setIsMobile,
      }}
    >
      {children}
    </UIStateContext.Provider>
  );
};

UIStateProvider.propTypes = {
  children: PropTypes.node,
  asides: PropTypes.arrayOf(PropTypes.func),
  modals: PropTypes.arrayOf(PropTypes.func),
  customTrayComponent: PropTypes.node,
};

export const useUIState = () => useContext(UIStateContext);
