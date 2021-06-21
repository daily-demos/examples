//
//  ViewController.swift
//  WebViewPrebuilt
//
//  Created by Daily on 10/06/2021.
//

import UIKit
import WebKit

class ViewController: UIViewController {
    private var webView: WKWebView? = nil

    override func viewDidLoad() {
        super.viewDidLoad()

        let webView = Self.makeWebView()
        self.webView = webView
        
        self.view.addSubview(webView)
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.leadingAnchor.constraint(equalTo: self.view.leadingAnchor).isActive = true
        webView.trailingAnchor.constraint(equalTo: self.view.trailingAnchor).isActive = true
        webView.topAnchor.constraint(equalTo: self.view.topAnchor).isActive = true
        webView.bottomAnchor.constraint(equalTo: self.view.bottomAnchor).isActive = true

        let url = URL(string: "[YOUR DAILY ROOM URL HERE]");
        
        webView.load(URLRequest(url: url!));
    }

    private static func makeWebView() -> WKWebView {
        let webpagePreferences = WKWebpagePreferences()
        webpagePreferences.allowsContentJavaScript = true
        webpagePreferences.preferredContentMode = .mobile

        let configuration = WKWebViewConfiguration()

        // Make sure the webview's `<audio>` elements are
        // allowed to auto-play inline:
        configuration.allowsInlineMediaPlayback = true
        // … and without user interaction:
        configuration.mediaTypesRequiringUserActionForPlayback = []
        configuration.defaultWebpagePreferences = webpagePreferences

        let webView = WKWebView(
            frame: CGRect.zero,
            configuration: configuration
        )

        
        // We pretend to be iOS Safari:
        webView.customUserAgent = """
            Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) \
            AppleWebKit/605.1.15 (KHTML, like Gecko) \
            Version/14.1 Mobile/15E148 Safari/604.1
        """

        webView.allowsBackForwardNavigationGestures = false
        webView.scrollView.isScrollEnabled = false

        return webView
    }
}
