I have spent some time over the last couple of weeks helping [a buddy of mine] with a project of his. I do not want to get into the non-technical details of the project here, but suffice to say, working on it has been fun and engrossing.

The project is currently based on [Flask], which, for me, is an interesting departure from Node. I managed to get the hang of the whole thing without too much trouble, although I got caught up on some of the syntax and idiosyncrasies of the Python language. Fortunately, we got the details ironed out, and we now have a naive prototype set up.

Working on the app, I created a basic authentication and authorization module from scratch, which leverages a simple session management component that I wrote. It is not very fancy, but it *works*. I also made a component to broker updates to be shared with connected clients, and it works in near real-time. Of course, when we implement web sockets, it should be quicker and more performant, but for now it works well enough.

I also helped out quite a bit in creating and managing the database schema and functions, through which I had the chance to learn a fair amount about PostgreSQL and PostGIS along the way. That was pretty interesting. (Note: [ST Distance] is not the same thing as [ST Distance Sphere], and neither is the same as [ST Distance Spheroid].)

Judging by the needs of the app, I think am going to suggest moving to a RESTful API with an Angular front-end. The app is not large in scope, but it does require a fair amount of dynamic behavior, and I would prefer to handle that portion with Angular, rather than build it from scratch.

The thing that is first and foremost on my mind is front-end UI frameworks, for the HTML and CSS. I tried Semantic UI for my site, and while I liked its look and some of the features, it also felt like I was fighting it to get what I wanted. I am close to just saying, "Okay, back to Bootstrap," but I would really like to find something else to try.

I have stumbled on [Ionic] and [OnsenUI], both of which really nice. Actually, I am watching the [Ionic Crash Course], right now. I think I might try to spin up a project when I get home.

[a buddy of mine]:http://www.andy-barr.com/
[Flask]:http://flask.pocoo.org/
[Ionic]:http://ionicframework.com/
[OnsenUI]:http://onsenui.io/
[Ionic Crash Course]:https://www.youtube.com/watch?v=C-UwOWB9Io4
[ST Distance]:http://postgis.refractions.net/docs/ST_Distance.html
[ST Distance Sphere]:http://postgis.net/docs/ST_Distance_Sphere.html
[ST Distance Spheroid]:http://postgis.net/docs/ST_Distance_Spheroid.html