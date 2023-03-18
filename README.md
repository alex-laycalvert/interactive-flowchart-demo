# interactive-flowchart-demo

This is a demo for an interactive flowchart made with [reactflow](https://reactflow.dev/) and [yjs](https://github.com/yjs/yjs).

## Running

To get started, first, clone the repo:

```bash
git clone https://github.com/alex-laycalvert/interactive-flowchart-demo

cd interactive-flowchart-demo
```

Then, build the server and start it:

```bash
cd server/

npm run build

npm run start
```

Finally, build and start the client:

```
cd client/

npm run build

npm run start
```

The server runs on port `5000` and the client runs on `3000`. To view,
open up a browser and go to [http://localhost:3000](http://localhost:3000).

Drag some nodes over from the top right onto the chart and connect them by
dragging from the handles on the top and bottoms of each node to other nodes.

To save you changes, click the Save Changes button in the top left.

Test out the interactivity by opening the application in multiple browsers.
