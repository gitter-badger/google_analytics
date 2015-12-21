var e107 = e107 || {'settings': {}, 'behaviors': {}};

(function ($)
{

	e107.google_analytics = {};

	$(document).ready(function ()
	{

		// Attach mousedown, keyup, touchstart events to document only and catch
		// clicks on all elements.
		$(document.body).bind("mousedown keyup touchstart", function (event)
		{

			// Catch the closest surrounding link of a clicked element.
			$(event.target).closest("a,area").each(function ()
			{

				// Is the clicked URL internal?
				if(e107.google_analytics.isInternal(this.href))
				{
					// Skip 'click' tracking, if custom tracking events are bound.
					if($(this).is('.colorbox'))
					{
						// Do nothing here. The custom event will handle all tracking.
						//console.info("Click on .colorbox item has been detected.");
					}
					// Is download tracking activated and the file extension configured for download tracking?
					else
					{
						if(e107.settings.google_analytics.trackDownload && e107.google_analytics.isDownload(this.href))
						{
							// Download link clicked.
							ga("send", "event", "Downloads", e107.google_analytics.getDownloadExtension(this.href).toUpperCase(), e107.google_analytics.getPageUrl(this.href));
						}
						else
						{
							if(e107.google_analytics.isInternalSpecial(this.href))
							{
								// Keep the internal URL for Google Analytics website overlay intact.
								ga("send", "pageview", {"page": e107.google_analytics.getPageUrl(this.href)});
							}
						}
					}
				}
				else
				{
					if(e107.settings.google_analytics.trackMailto && $(this).is("a[href^='mailto:'],area[href^='mailto:']"))
					{
						// Mailto link clicked.
						ga("send", "event", "Mails", "Click", this.href.substring(7));
					}
					else
					{
						if(e107.settings.google_analytics.trackOutbound && this.href.match(/^\w+:\/\//i))
						{
							if(e107.settings.google_analytics.trackDomainMode != 2 || (e107.settings.google_analytics.trackDomainMode == 2 && !e107.google_analytics.isCrossDomain(this.hostname, e107.settings.google_analytics.trackCrossDomains)))
							{
								// External link clicked / No top-level cross domain clicked.
								ga("send", "event", "Outbound links", "Click", this.href);
							}
						}
					}
				}
			});
		});

		// Track hash changes as unique pageviews, if this option has been enabled.
		if(e107.settings.google_analytics.trackUrlFragments)
		{
			window.onhashchange = function ()
			{
				ga('send', 'pageview', location.pathname + location.search + location.hash);
			}
		}

		// Colorbox: This event triggers when the transition has completed and the
		// newly loaded content has been revealed.
		$(document).bind("cbox_complete", function ()
		{
			var href = $.colorbox.element().attr("href");
			if(href)
			{
				ga("send", "pageview", {"page": e107.google_analytics.getPageUrl(href)});
			}
		});

	});

	/**
	 * Check whether the hostname is part of the cross domains or not.
	 *
	 * @param hostname
	 *   The hostname of the clicked URL.
	 * @param crossDomains
	 *   All cross domain hostnames as JS array.
	 *
	 * @return boolean
	 */
	e107.google_analytics.isCrossDomain = function (hostname, crossDomains)
	{
		/**
		 * jQuery < 1.6.3 bug: $.inArray crushes IE6 and Chrome if second argument is
		 * `null` or `undefined`, http://bugs.jquery.com/ticket/10076,
		 * https://github.com/jquery/jquery/commit/a839af034db2bd934e4d4fa6758a3fed8de74174
		 */
		if(!crossDomains)
		{
			return false;
		}
		else
		{
			return $.inArray(hostname, crossDomains) > -1 ? true : false;
		}
	};

	/**
	 * Check whether this is a download URL or not.
	 *
	 * @param url
	 *   The web url to check.
	 *
	 * @return boolean
	 */
	e107.google_analytics.isDownload = function (url)
	{
		var isDownload = new RegExp("\\.(" + e107.settings.google_analytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
		return isDownload.test(url);
	};

	/**
	 * Check whether this is an absolute internal URL or not.
	 *
	 * @param url
	 *   The web url to check.
	 *
	 * @return boolean
	 */
	e107.google_analytics.isInternal = function (url)
	{
		var isInternal = new RegExp("^(https?):\/\/" + window.location.host, "i");
		return isInternal.test(url);
	};

	/**
	 * Check whether this is a special URL or not.
	 *
	 * URL types:
	 *  - gotwo.module /go/* links.
	 *
	 * @param url
	 *   The web url to check.
	 *
	 * @return boolean
	 */
	e107.google_analytics.isInternalSpecial = function (url)
	{
		var isInternalSpecial = new RegExp("(\/go\/.*)$", "i");
		return isInternalSpecial.test(url);
	};

	/**
	 * Extract the relative internal URL from an absolute internal URL.
	 *
	 * Examples:
	 * - http://example.com/foo/bar -> http://example.com/foo/bar
	 *
	 * @param url
	 *   The web url to check.
	 *
	 * @return string
	 *   Internal website URL
	 */
	e107.google_analytics.getPageUrl = function (url)
	{
		var extractInternalUrl = new RegExp("^(https?):\/\/" + window.location.host, "i");
		return url.replace(extractInternalUrl, '');
	};

	/**
	 * Extract the download file extension from the URL.
	 *
	 * @param url
	 *   The web url to check.
	 *
	 * @return string
	 *   The file extension of the passed url. e.g. "zip", "txt"
	 */
	e107.google_analytics.getDownloadExtension = function (url)
	{
		var extractDownloadextension = new RegExp("\\.(" + e107.settings.google_analytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
		var extension = extractDownloadextension.exec(url);
		return (extension === null) ? '' : extension[1];
	};

})(jQuery);
