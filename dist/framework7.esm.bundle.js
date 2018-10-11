/**
 * Framework7 3.4.0
 * Full featured mobile HTML framework for building iOS & Android apps
 * http://framework7.io/
 *
 * Copyright 2014-2018 Vladimir Kharlampidi
 *
 * Released under the MIT License
 *
 * Released on: October 11, 2018
 */

import Template7 from 'template7';
import $ from 'dom7';

// F7 Class
import Framework7 from './components/app/app-class';

// Import Helpers
import Request from './utils/request';
import Utils from './utils/utils';
import Support from './utils/support';
import Device from './utils/device';

// Core Modules
import DeviceModule from './modules/device/device';
import SupportModule from './modules/support/support';
import UtilsModule from './modules/utils/utils';
import ResizeModule from './modules/resize/resize';
import RequestModule from './modules/request/request';
import TouchModule from './modules/touch/touch';
import ClicksModule from './modules/clicks/clicks';
import RouterModule from './modules/router/router';
import HistoryModule from './modules/history/history';
import StorageModule from './modules/storage/storage';
import ComponentModule from './modules/component/component';

// Core Components
import Statusbar from './components/statusbar/statusbar';
import View from './components/view/view';
import Navbar from './components/navbar/navbar';
import Toolbar from './components/toolbar/toolbar';
import Subnavbar from './components/subnavbar/subnavbar';
import TouchRipple from './components/touch-ripple/touch-ripple';
import Modal from './components/modal/modal';

import Popup from './components/popup/popup';
import Popover from './components/popover/popover';
import Preloader from './components/preloader/preloader';
import Progressbar from './components/progressbar/progressbar';
import Swipeout from './components/swipeout/swipeout';
import Tabs from './components/tabs/tabs';
import Panel from './components/panel/panel';
import Input from './components/input/input';
import Checkbox from './components/checkbox/checkbox';
import Toggle from './components/toggle/toggle';
import InfiniteScroll from './components/infinite-scroll/infinite-scroll';
import PullToRefresh from './components/pull-to-refresh/pull-to-refresh';
import Fab from './components/fab/fab';
import Messages from './components/messages/messages';
import Messagebar from './components/messagebar/messagebar';
import Swiper from './components/swiper/swiper';
import Notification from './components/notification/notification';
import Elevation from './components/elevation/elevation';
import Typography from './components/typography/typography';

if ("es" !== 'es') {
  if (typeof window !== 'undefined') {
    // Template7
    if (!window.Template7) window.Template7 = Template7;

    // Dom7
    if (!window.Dom7) window.Dom7 = $;
  }
}

// Install Core Modules & Components
Framework7.use([
  DeviceModule,
  SupportModule,
  UtilsModule,
  ResizeModule,
  RequestModule,
  TouchModule,
  ClicksModule,
  RouterModule,
  HistoryModule,
  StorageModule,
  ComponentModule,
  Statusbar,
  View,
  Navbar,
  Toolbar,
  Subnavbar,
  TouchRipple,
  Modal,
  Popup,
  Popover,
  Preloader,
  Progressbar,
  Swipeout,
  Tabs,
  Panel,
  Input,
  Checkbox,
  Toggle,
  InfiniteScroll,
  PullToRefresh,
  Fab,
  Messages,
  Messagebar,
  Swiper,
  Notification,
  Elevation,
  Typography
]);

export { Template7, $ as Dom7, Request, Utils, Device, Support };
export default Framework7;
