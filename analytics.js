/**
 * Vociferous Analytics — PostHog integration
 * Shared config across vociferous.ai and vociferous.nyc
 */
(function () {
  // Public PostHog project token for browser analytics — not a secret.
  // phc_ keys are write-only ingestion tokens safe for client-side use.
  // See: https://posthog.com/docs/libraries/js#installation
  var PH_KEY  = 'phc_QVqqcAnIzLttVd0RqyjTMRF2wJdeDZ8bbHux2pO1kYN'; // posthog-project-api-key:public
  var PH_HOST = 'https://us.i.posthog.com';

  var hostname = location.hostname;
  var isLocal  = !hostname || hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
  if (isLocal) return;

  var SITE_MAP = {
    'vociferous.ai':      'vociferous_ai',
    'www.vociferous.ai':  'vociferous_ai',
    'vociferous.nyc':     'vociferous_nyc',
    'www.vociferous.nyc': 'vociferous_nyc'
  };
  var siteSlug = SITE_MAP[hostname] || 'unknown';
  var env = hostname.indexOf('.github.io') !== -1 ? 'preview' : 'production';

  // PostHog loader (official browser snippet)
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com",".posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing startSessionRecording stopSessionRecording sessionRecordingStarted loadToolbar get_distinct_id getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_session_id get_session_replay_url alias set_config get_config startSurvey getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  posthog.init(PH_KEY, {
    api_host:                    PH_HOST,
    person_profiles:             'identified_only',
    autocapture:                 true,
    capture_pageview:            true,
    capture_pageleave:           true,
    disable_session_recording:   true
  });

  posthog.register({
    site_slug:  siteSlug,
    site_group: 'vociferous',
    env:        env
  });

  // CTA click tracking — binds to all elements with data-ph-cta
  function trackCTA(el) {
    var href     = el.getAttribute('href') || '';
    var linkType = 'internal';
    if (href.indexOf('mailto:') === 0)                                  linkType = 'mailto';
    else if (href.indexOf('tel:') === 0)                                linkType = 'phone';
    else if (/^https?:\/\//.test(href) && href.indexOf(hostname) === -1) linkType = 'external';

    posthog.capture('cta_click', {
      cta_name:       el.getAttribute('data-ph-cta'),
      cta_location:   el.getAttribute('data-ph-cta-location') || '',
      cta_text:       (el.textContent || '').trim().substring(0, 100),
      cta_target_url: href,
      link_type:      linkType,
      site_slug:      siteSlug,
      host:           hostname,
      page_path:      location.pathname,
      page_title:     document.title
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var ctas = document.querySelectorAll('[data-ph-cta]');
    for (var i = 0; i < ctas.length; i++) {
      ctas[i].addEventListener('click', function () { trackCTA(this); });
    }
  });
})();
