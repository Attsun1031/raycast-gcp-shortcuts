# raycast-gcp-shortcuts

## !!! IMPORTANT NOTE !!!
This plugin is under development and is not published to the store.

Please use at your own risk.

## How to install

At first, please clone this repository.
```
git clone THIS_REPOSITORY
```

Go to the repository root.
```
cd path/to/this-repoisotry
```

Install depenedencies and run this app.
You can quit `npm run dev` after you see `✅ Build complete` message.
```
npm install
npm run dev
```

Setup your projects file as the following command. (GCP Shortcuts suggest projects from this file.)

```
gcloud projects list --format="value(projectId)" --sort-by=projectId > ~/.raycast-gcp-shortcuts
```


## How to use
1. Launch raycast
2. Type `GCP`
3. Select `Search GCP Projects`
4. Select one of the projects. You can search by typing words.
5. Select one of the GCP products. You can search by typing words.
