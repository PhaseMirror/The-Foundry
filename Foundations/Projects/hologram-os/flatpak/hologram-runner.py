import sys
import gi

gi.require_version('Gtk', '4.0')
gi.require_version('WebKit', '6.0')
from gi.repository import Gtk, WebKit, GLib

def on_activate(app):
    win = Gtk.ApplicationWindow(application=app)
    win.set_title("Hologram OS")
    win.set_default_size(1280, 720)

    webview = WebKit.WebView()
    webview.load_uri("https://hologram-technologies.github.io/hologram-os")
    
    win.set_child(webview)
    win.present()

app = Gtk.Application(application_id='io.hologram.OS')
app.connect('activate', on_activate)

app.run(sys.argv)
