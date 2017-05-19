import $ from 'dom7';
import Utils from '../../utils/utils';
import History from '../../utils/history';

function forward(el, forwardOptions = {}) {
  const router = this;
  const view = router.view;

  const options = Utils.extend({
    animate: router.params.animatePages,
    pushState: true,
    history: true,
    reloadCurrent: router.params.reloadPages,
    on: {},
  }, forwardOptions);

  const dynamicNavbar = router.app.theme === 'ios' && router.params.iosDynamicNavbar;

  const $pagesEl = router.$pagesEl;
  const $newPage = $(el);
  let $oldPage;

  let $navbarEl;
  let $newNavbarInner;
  let $oldNavbarInner;

  if (dynamicNavbar) {
    $navbarEl = router.$navbarEl;
    $newNavbarInner = $newPage.children('.navbar').children('.navbar-inner');
    if ($newNavbarInner.length > 0) {
      $newPage.children('.navbar').remove();
    }
    if ($newNavbarInner.length === 0 && $newPage[0].f7Page) {
      // Try from pageData
      $newNavbarInner = $newPage[0].f7Page.$navbarEl;
    }
  }

  router.allowPageChange = false;
  if ($newPage.length === 0) {
    router.allowPageChange = true;
    return router;
  }

  // Pages In View
  const $pagesInView = $pagesEl
    .children('.page:not(.stacked)')
    .filter((index, pageInView) => pageInView !== $newPage[0]);

  // Navbars In View
  let $navbarsInView;
  if (dynamicNavbar) {
    $navbarsInView = $navbarEl
      .children('.navbar-inner:not(.stacked)')
      .filter((index, navbarInView) => navbarInView !== $newNavbarInner[0]);
  }

  // Exit when reload previous and only 1 page in view
  if (options.reloadPrevious && $pagesInView.length < 2) {
    router.allowPageChange = true;
    return router;
  }

  // New Page
  let newPagePosition = 'next';
  if (options.reloadCurrent || options.reloadAll) {
    newPagePosition = 'current';
  } else if (options.reloadPrevious) {
    newPagePosition = 'previous';
  }
  $newPage
    .addClass(`page-${newPagePosition}`)
    .removeClass('stacked');

  if (dynamicNavbar) {
    $newNavbarInner
      .addClass(`navbar-${newPagePosition}`)
      .removeClass('stacked');
  }

  // Find Old Page
  if (options.reloadCurrent) {
    $oldPage = $pagesInView.eq($pagesInView.length - 1);
    if (dynamicNavbar) {
      $oldNavbarInner = $navbarsInView.eq($pagesInView.length - 1);
    }
  } else if (options.reloadPrevious) {
    $oldPage = $pagesInView.eq($pagesInView.length - 2);
    if (dynamicNavbar) {
      $oldNavbarInner = $navbarsInView.eq($pagesInView.length - 2);
    }
  } else {
    if ($pagesInView.length > 1) {
      let i = 0;
      for (i = 0; i < $pagesInView.length - 1; i += 1) {
        if (router.params.stackPages) {
          $pagesInView.eq(i).addClass('stacked');
          if (dynamicNavbar) {
            $navbarsInView.eq(i).addClass('stacked');
          }
        } else {
          // Page remove event
          router.pageCallback('beforeRemove', $pagesInView[i], $navbarsInView[i], 'previous', options);
          router.remove($pagesInView[i]);
          if (dynamicNavbar) {
            router.remove($navbarsInView[i]);
          }
        }
      }
    }
    $oldPage = $pagesEl
      .children('.page:not(.stacked)')
      .filter((index, page) => page !== $newPage[0]);
    if (dynamicNavbar) {
      $oldNavbarInner = $navbarEl
        .children('.navbar-inner:not(.stacked)')
        .filter((index, navbarInner) => navbarInner !== $newNavbarInner[0]);
    }
  }

  // Push State
  if (router.params.pushState && options.pushState && !options.reloadPrevious) {
    const pushStateRoot = router.params.pushStateRoot || '';

    History[options.reloadCurrent ? 'replace' : 'push'](
      { url: options.route.url,
        viewIndex: view.index,
      }, pushStateRoot + router.params.pushStateSeparator + options.route.url);
  }

  // Update router history
  const url = options.route.url;
  router.url = options.route.url;
  if (options.history) {
    if (options.reloadCurrent && router.history.length > 0) {
      router.history[router.history.length - (options.reloadPrevious ? 2 : 1)] = url;
    } else {
      router.history.push(url);
    }
  }
  router.saveHistory();

  // Insert new page and navbar
  const needsAttachedCallback = $newPage.parents(document).length === 0;
  if (options.reloadPrevious) {
    $newPage.insertBefore($oldPage);
    if (dynamicNavbar) {
      $newNavbarInner.insertBefore($oldNavbarInner);
    }
  } else if ($oldPage.next('.page')[0] !== $newPage[0]) {
    $pagesEl.append($newPage[0]);
    if (dynamicNavbar) {
      $navbarEl.append($newNavbarInner[0]);
    }
  }
  if (needsAttachedCallback) {
    router.pageCallback('attached', $newPage, $newNavbarInner, newPagePosition, options);
  }

  // Remove old page
  if (options.reloadCurrent && $oldPage.length > 0) {
    if (router.params.stackPages && router.initialPages.indexOf($oldPage[0]) >= 0) {
      $oldPage.addClass('stacked');
      if (dynamicNavbar) {
        $newNavbarInner.addClass('stacked');
      }
    } else {
      // Page remove event
      router.pageCallback('beforeRemove', $oldPage, $newNavbarInner, 'previous', options);
      router.remove($oldPage);
      if (dynamicNavbar) {
        router.remove($oldNavbarInner);
      }
    }
  }

  // Current Route
  router.currentRoute = options.route;
  router.currentPage = $newPage[0];

  // Page init and before init events
  router.pageCallback('init', $newPage, $newNavbarInner, newPagePosition, options);

  if (options.reloadCurrent) {
    router.allowPageChange = true;
    return router;
  }

  // Before animation event
  router.pageCallback('beforeIn', $newPage, $newNavbarInner, 'next', options);
  router.pageCallback('beforeStack', $oldPage, $oldNavbarInner, 'current', options);

  // Animation
  function afterAnimation() {
    const pageClasses = 'page-previous page-current page-next page-next-in page-out page-previous-in page-stack';
    const navbarClasses = 'navbar-previous navbar-current navbar-next navbar-next-in navbar-out navbar-previous-in navbar-stack';
    $newPage.removeClass(pageClasses).addClass('page-current');
    $oldPage.removeClass(pageClasses).addClass('page-previous');
    if (dynamicNavbar) {
      $newNavbarInner.removeClass(navbarClasses).addClass('navbar-current');
      $oldNavbarInner.removeClass(navbarClasses).addClass('navbar-previous');
      $newNavbarInner.add($oldNavbarInner).find('.sliding').transform('');
    }
    // After animation event
    router.allowPageChange = true;
    router.pageCallback('afterIn', $newPage, $newNavbarInner, 'next', options);
    router.pageCallback('afterStack', $oldPage, $oldNavbarInner, 'current', options);

    if (!(view.params.swipeBackPage || router.params.preloadPreviousPage)) {
      if (router.params.stackPages) {
        $oldPage.addClass('stacked');
        if (dynamicNavbar) {
          $oldNavbarInner.addClass('stacked');
        }
      } else if (!(url.indexOf('#') === 0 && $newPage.attr('data-page').indexOf('smart-select-') === 0)) {
        // Remove event
        router.pageCallback('beforeRemove', $oldPage, $oldNavbarInner, 'previous', options);
        router.remove($oldPage);
        if (dynamicNavbar) {
          router.remove($oldNavbarInner);
        }
      }
    }
    router.emit('routeChanged route:changed', router.currentRoute, router.previousRoute, router);

    if (router.params.pushState) {
      History.clearQueue();
    }
  }

  if (options.animate) {
    if (router.app.theme === 'md' && router.params.materialPageLoadDelay) {
      setTimeout(() => {
        router.animatePages($oldPage, $newPage, 'next', 'current');
        router.animateNavbars($oldNavbarInner, $newNavbarInner, 'next', 'current');
      }, router.params.materialPageLoadDelay);
    } else {
      router.animatePages($oldPage, $newPage, 'next', 'current');
      router.animateNavbars($oldNavbarInner, $newNavbarInner, 'next', 'current');
    }
    $newPage.animationEnd(() => {
      afterAnimation();
    });
  } else {
    afterAnimation();
  }

  return router;
}
function load(loadParams = {}, loadOptions = {}, ignorePageChange) {
  const router = this;

  if (!router.allowPageChange && !ignorePageChange) return router;
  const params = loadParams;
  const options = loadOptions;
  const { url, content, el, name, template, templateUrl, component, componentUrl } = params;
  const { ignoreCache } = options;

  if (
    options.route.url &&
    router.url === options.route.url &&
    !(options.reloadCurrent || options.reloadPrevious) &&
    !router.params.allowDuplicateUrls
    ) {
    return false;
  }

  if (!options.route && url) {
    options.route = router.findMatchingRoute(url, true);
  }

  // Component Callbacks
  function proceed(pageEl, newOptions) {
    return router.forward(pageEl, Utils.extend(options, newOptions));
  }
  function release() {
    router.allowPageChange = true;
    return router;
  }

  // Proceed
  if (content) {
    router.forward(router.getPageEl(content), options);
  } else if (template || templateUrl) {
    // Parse template and send page element
    try {
      router.templateLoader(template, templateUrl, options, proceed, release);
    } catch (err) {
      router.allowPageChange = true;
      throw err;
    }
  } else if (el) {
    // Load page from specified HTMLElement or by page name in pages container
    router.forward(router.getPageEl(el), options);
  } else if (name) {
    // Load page by page name in pages container
    router.forward(router.$pagesEl.find(`.page[data-page="${name}"]`).eq(0), options);
  } else if (component || componentUrl) {
    // Load from component (F7/Vue/React/...)
    try {
      router.componentLoader(component, componentUrl, options, proceed, release);
    } catch (err) {
      router.allowPageChange = true;
      throw err;
    }
  } else if (url) {
    // Load using XHR
    if (router.xhr) {
      router.xhr.abort();
      router.xhr = false;
    }
    router.xhrRequest(url, ignoreCache)
      .then((pageContent) => {
        router.forward(router.getPageEl(pageContent), options);
      })
      .catch(() => {
        router.allowPageChange = true;
      });
  }
  return router;
}
function navigate(url, navigateOptions = {}) {
  const router = this;
  const app = router.app;
  if (!router.view) {
    app.views.main.router.navigate(url, navigateOptions);
    return router;
  }

  let navigateUrl = url;
  if (navigateUrl[0] !== '/' && navigateUrl.indexOf('#') !== 0) {
    navigateUrl = ((router.path || '/') + navigateUrl).replace('//', '/');
  }
  const route = router.findMatchingRoute(navigateUrl);

  if (!route) {
    return router;
  }
  const options = {};
  if (route.route.options) {
    Utils.extend(options, route.route.options, navigateOptions, { route });
  } else {
    Utils.extend(options, navigateOptions, { route });
  }

  ('url content name el component componentUrl template templateUrl').split(' ').forEach((pageLoadProp) => {
    if (route.route[pageLoadProp]) {
      router.load({ [pageLoadProp]: route.route[pageLoadProp] }, options);
    }
  });
  // Async
  function asyncProceed(prceedParams, proceedOptions) {
    router.allowPageChange = false;
    router.load(prceedParams, Utils.extend(options, proceedOptions), true);
  }
  function asyncRelease() {
    router.allowPageChange = true;
  }
  if (route.route.async) {
    router.allowPageChange = false;

    route.route.async(asyncProceed, asyncRelease);
  }
  // Retur Router
  return router;
}
export { forward, load, navigate };