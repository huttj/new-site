When I last checked in, I had just finished prototyping a *real-time, location-based social communication and networking app&#153;*. The front-end was written in [Ionic], and the back-end was written in Flask.

Unfortunately (or fortunately, depending on how you look at it), my implementation with [SocketIO on Flask], while functioning, was not as quick and reliable as we needed. The flaw may very well have been in my implementation, but its unreliable performance, coupled with the incompatibility with the latest SocketIO client and the extreme difficulty I had in figuring out [how to get a reference to the actual incoming socket](javascript:void(0) "It turns out the socket is actually 'request.namespace'. Quite a strange an un-semantic choice. I would have called it 'request.socket'."), led me to strongly desire to try something else.

So, after coming to terms with the situation, I threw together the same functionality in NodeJS in about an hour. That was functionality that took me about a week or so of intermittant effort. So, I think the logical conclusion is that I am much more comfortable in Node than I am in Flask.

Moving to Node was a definite boon to the project. Development and deployment have been easier and more straightforward, and the back-end seems way more responsive.

One of the most significant differences is the responsiveness of the *disconnect* event. In the Flask implementation, it would take up to a minute for the server to determine that a client had disconnected. In stark contrast, the Node implementation detects and responds to the disconnect event virtually instantaneously. The result is that one client can observe the status of another changing in real-time. My guess is that the Flask implementation was not actually using sockets, but rather falling back on a different protocol (e.g., long-polling).

So, long story short, I've put together an MVP in Node, and it is working well. There are a lot of small improvements that need to be made before we start testing, but it should come together pretty quickly.

The main lesson I learned is: read the (author's) comments in blog posts. Especially when that blog post is where the author introduces a library or plugin that you intend to use. Overlooking that one comment caused hours of trial-and-error that could have been easily avoided. (Although, I would prefer the naming to be more semantic, in this case.)

[Ionic]:http://www.ionicframework.com/
[SocketIO on Flask]:https://github.com/miguelgrinberg/Flask-SocketIO