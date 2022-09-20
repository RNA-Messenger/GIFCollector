# RUBI's GIF Collection

![image](https://user-images.githubusercontent.com/54856927/191141964-2b06f352-fff3-41db-8341-fc6b229f24ff.png)


Create a [Mongo Atlas](https://www.mongodb.com/docs/atlas/tutorial/create-atlas-account/) account. It's free and quite quick. Once you have an account, set a cluster and copy the URI it will provide to the .env file. You can use the env.example file on the repo.
Then, clone the repo and install all the needed dependencies:

> git clone [repo]

> npm i

Start the server up with:
> npm run serve

- You can upload a GIF
- You can delete a GIF
- You can copy the GIF url to your clipboard
- You can view an individual GIF
- It's using GridFS and Multer to upload files and host them on Mongo


## TODO:
- Add the GIF model and Schema to better integrate the tag system.
- Replace GridFS Storage with Buckets. Will need to have the point above implemented for this.
- Filter by tags.
- Valdiate upload form.
- Add tests.
