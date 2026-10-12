# 🛠️ imgto.xyz
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Easily optimize and convert your images to modern, efficient formats for free using imgto.xyz.

## What's Inside

Tech used to build imgto.xyz includes:

* Next.js App Router
* Styling with Tailwind CSS
* Cloudinary for image upload, optimization, and conversion

Features include:

* Upload up to 20 images at a time, up to 10 MB each (AVIF, JPG, PNG, WebP, JXL, HEIC, and HEIF)
* Convert to AVIF, WebP, JPG, PNG, or JXL, or keep the original format
* Choose a quality level using Cloudinary's automatic quality (`q_auto:best`, `q_auto:good`, `q_auto:eco`, `q_auto:low`)
* Progressive rendering for JPG and PNG
* Download images one at a time, in another format, or all together as a zip

## Getting Started

### Requirements

* Node.js 18.17 or later
* A [Cloudinary account](https://cloudinary.com/users/register_free) (the free plan works)

### Setup

1. Clone the project or create a new copy:

```
git clone https://github.com/cloudinary-community/imgto.xyz.git
```

If you want to create a new copy, you can either fork or run:

```
npx create-next-app@latest -e https://github.com/cloudinary-community/imgto.xyz imgto.xyz
```

2. Create a .env.local file or configure your environment variables to include:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="<Your Cloud Name>"
NEXT_PUBLIC_CLOUDINARY_API_KEY="<Your API Key>"
CLOUDINARY_API_SECRET="<Your API Secret>"
NEXT_PUBLIC_CLOUDINARY_UPLOADS_FOLDER="imgto.xyz"
```

You can find your Cloud Name, API Key, and API Secret on the **API Keys** page of the [Cloudinary Console](https://console.cloudinary.com/settings/api-keys). See [Environment Variables](#environment-variables) for what each one does.

3. Create an upload preset named `imgtoxyz` in your Cloudinary account.

Every upload uses this preset. If it's missing, uploads fail with `Upload preset not found`.

To create it in the [Cloudinary Console](https://console.cloudinary.com/settings/upload/presets):

* Go to **Settings** > **Upload Presets** and click **Add Upload Preset**
* Set **Upload preset name** to `imgtoxyz`
* Set **Signing mode** to **Signed**
* Under **Moderation**, add **Manual** moderation
* Click **Save**

The preset must be **Signed**. Uploads are signed by the app's `/api/sign` endpoint, and an unsigned preset would let anyone upload to your account without going through it.

**Manual** moderation marks every upload as pending, which is how the [media cleanup job](#media-cleanup) finds uploads to delete. Without it, uploaded images stay in your account.

Alternatively, you can create it with the [Upload Presets Admin API](https://cloudinary.com/documentation/admin_api#create_an_upload_preset):

```
curl -u "<Your API Key>:<Your API Secret>" \
  -X POST https://api.cloudinary.com/v1_1/<Your Cloud Name>/upload_presets \
  -d name=imgtoxyz \
  -d unsigned=false \
  -d moderation=manual
```

_Optional: imgto.xyz rejects images flagged by Amazon Rekognition moderation. To turn this on, install the [Amazon Rekognition AI Moderation add-on](https://cloudinary.com/documentation/aws_rekognition_ai_moderation_addon) and add **AWS Rekognition** moderation to the preset before **Manual** (with the API, use `moderation=aws_rek|manual`)._

4. (Optional) Add the homepage images to your Cloudinary account.

The homepage displays images that are loaded from your Cloudinary account. Without them, the app still works but those images show 404 errors in the browser console.

| Public ID | Used for |
| --- | --- |
| `assets/imgtoxyz-quality-compression_wqtda6` | "Compress Images" homepage image |
| `assets/imgtoxyz-format-converter_obubig` | "Convert Images" homepage image |
| `assets/cloudinary-blue_mtkkjm` | Cloudinary logo |
| `assets/imgtoxyz-social-card_gxzddx` | Social sharing (Open Graph) image |

You can upload your own images with these public IDs in the Cloudinary Console, or copy the ones from imgto.xyz by running this from the project root once your `.env.local` is set up:

```
node -e "
require('dotenv').config({ path: '.env.local' });
const { v2: cloudinary } = require('cloudinary');
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
['imgtoxyz-quality-compression_wqtda6', 'imgtoxyz-format-converter_obubig', 'cloudinary-blue_mtkkjm', 'imgtoxyz-social-card_gxzddx'].forEach(async (id) => {
  const result = await cloudinary.uploader.upload('https://res.cloudinary.com/imgtoxyz/image/upload/assets/' + id, { public_id: 'assets/' + id });
  console.log('Uploaded', result.public_id);
});
"
```

5. Install dependencies and start the project.

```
npm install
npm run dev
```

And you should now be running imgto.xyz at http://localhost:3000/!

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Yes | Your Cloudinary cloud name, used for uploads and image delivery. |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | Yes | Your Cloudinary API key, sent with signed uploads. |
| `CLOUDINARY_API_SECRET` | Yes | Your Cloudinary API secret, used only on the server by `/api/sign`. Never prefix it with `NEXT_PUBLIC_` or it will be exposed to the browser. |
| `NEXT_PUBLIC_CLOUDINARY_UPLOADS_FOLDER` | No | Folder that uploads are stored in. If set, `/api/sign` only signs uploads to this folder. |

The [media cleanup job](#media-cleanup) uses its own set of variables. See below.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server at http://localhost:3000 |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint the project |

Stop the development server before running `npm run build`. Both write to the `.next` folder, and building while the dev server is running can break the page in your browser (for example, `Uncaught SyntaxError: Invalid or unexpected token`) until you restart the dev server.

## How It Works

1. Images are read in the browser to show a preview. HEIC and HEIF images are converted to JPG first, since most browsers can't display them.
2. The browser asks `/api/sign` to sign the upload. Because this endpoint is public, it only signs the `imgtoxyz` upload preset, the configured uploads folder, and a timestamp within 10 minutes of the current time.
3. The image is uploaded directly to Cloudinary with the signature.
4. The optimized image is delivered from Cloudinary using the selected format, quality, and progressive settings. Changing a setting re-optimizes images that are already done.
5. Downloads use the optimized images already fetched in the browser. "Download All" creates the zip in the browser, so images don't pass through the server.

To avoid overloading the browser or hitting Cloudinary rate limits, images are read, uploaded, and optimized through shared queues with limited concurrency. Network errors, rate limits (HTTP 420 and 429), and server errors are retried with backoff.

## Media Cleanup

imgto.xyz doesn't keep the images people upload. A [GitHub Actions workflow](.github/workflows/media-cleanup.yml) runs `scripts/media-cleanup.js` every 30 minutes. It deletes every asset in the Cloudinary account whose moderation status is **manual** / **pending** and that is older than 5 minutes.

**Warning:** this deletes _all_ pending manually moderated assets in the account, not only ones uploaded by imgto.xyz. Use a Cloudinary account (or product environment) that's dedicated to imgto.xyz.

To set it up on your fork, add these repository secrets under **Settings** > **Secrets and variables** > **Actions**:

* `CLOUDINARY_CLOUD_NAME`
* `CLOUDINARY_API_KEY`
* `CLOUDINARY_API_SECRET`

To run it locally, set the same three variables in your shell or in a `.env` file (the script doesn't read `.env.local`), then run:

```
node scripts/media-cleanup.js
```

## Troubleshooting

| Problem | Solution |
| --- | --- |
| Uploads fail and the console shows `Upload preset not found` | Create the `imgtoxyz` upload preset (Setup step 3). |
| Uploads fail with `Invalid Signature` | Check that `CLOUDINARY_API_SECRET` matches the API key and cloud name, then restart the dev server after changing `.env.local`. |
| `/api/sign` returns `400 Invalid upload parameters` | `NEXT_PUBLIC_CLOUDINARY_UPLOADS_FOLDER` must be the same value when the app is built and when it runs. Restart the dev server after changing it. |
| Homepage images return 404 | Add the homepage images to your account (Setup step 4). |
| "Try disabling any Ad Blockers" error | An ad blocker or privacy extension is blocking requests to `res.cloudinary.com`. Allow the site and try again. |
| "Too many images are being optimized right now" | Cloudinary is rate limiting your account. Wait a few minutes and try again. |
| `Uncaught SyntaxError: Invalid or unexpected token` and buttons don't respond | Stop the dev server, delete the `.next` folder, and run `npm run dev` again. If it continues, try a private window to rule out browser extensions. |

## Using imgto.xyz

To start using imgto.xyz, drag and drop your images onto the upload area at the top of the homepage, or click **Upload a File**.

Below the upload area, choose the output format, quality, and whether JPG and PNG images should be progressive. You can change these at any time, including after your images are optimized.

After uploading, your images are optimized using Cloudinary. You can then:

* Click **Download** to download an optimized image
* Click **Download As** to download it in a different format
* Click **Download All** to download every optimized image as a zip file

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://colbyfayock.com/newsletter"><img src="https://avatars.githubusercontent.com/u/1045274?v=4?s=100" width="100px;" alt="Colby Fayock"/><br /><sub><b>Colby Fayock</b></sub></a><br /><a href="https://github.com/cloudinary-community/imgto.xyz/commits?author=colbyfayock" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://sepahvand.me"><img src="https://avatars.githubusercontent.com/u/64675666?v=4?s=100" width="100px;" alt="Sina Sepahvand"/><br /><sub><b>Sina Sepahvand</b></sub></a><br /><a href="https://github.com/cloudinary-community/imgto.xyz/commits?author=sina-ss" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://mmbh.dev"><img src="https://avatars.githubusercontent.com/u/20746840?v=4?s=100" width="100px;" alt="Mohamed"/><br /><sub><b>Mohamed</b></sub></a><br /><a href="https://github.com/cloudinary-community/imgto.xyz/commits?author=negativems" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
