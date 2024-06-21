# 🛠️ imgto.xyz

Easily optimize and convert your images to modern, efficent formats for free using imgto.xyz.

## What's Inside

Tech used to build imgto.xyz includes:

* Next.js App Router
* Styling with Tailwind CSS
* Cloudinary for image upload, optimization, and conversion

## Getting Started

1. Create a new local project

```
npx create-next-app@latest https://github.com/cloudinary-community/imgto.xyz
```

You can also fork or clone the project manually!

2. Create a .env.local file or configure your environment variables to include:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="<Your Cloud Name>"
NEXT_PUBLIC_CLOUDINARY_API_KEY="<Your API Key>"
CLOUDINARY_API_SECRET="<Your API Secret>"
NEXT_PUBLIC_CLOUDINARY_UPLOADS_FOLDER="imgto.xyz"
```

3. Install dependencies and start the project.

```
npm install
npm run dev
```

And you should now be running imgto.xyz at http://localhost:3000/!

## Using imgto.xyz

To start using imgto.xyz, simply upload some images! The Upload button can be found on the top right homepage.

After uploading, your images will be optimized using Cloudinary tech.

You'll be prompted to download your optimized file or alternatively download your file in a more efficient, modern format if available.
