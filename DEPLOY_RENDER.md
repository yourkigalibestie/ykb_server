# Render Free Deployment Guide for Backend

This guide walks you through deploying the `Your Kigali Bestie` backend to Render's **Free Web Service** tier.

---

## 1. Quick Setup via Render Blueprint (Recommended)

Render can automatically read [`render.yaml`](file:///d:/MP/AI/Clients/Your_Kigali_Bestie/backend/render.yaml):

1. Push your latest code to your GitHub / GitLab repository.
2. Go to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** → **Blueprint**.
4. Connect your GitHub repository (`yourkigalibestie/ykb_server` or the root repository).
5. Render will detect `render.yaml` and configure the **ykb-backend** service automatically.
6. Fill in the required environment variables when prompted.
7. Click **Apply**.

---

## 2. Manual Web Service Setup (Alternative)

If you prefer to configure the Web Service manually:

1. In [Render Dashboard](https://dashboard.render.com/), click **New +** → **Web Service**.
2. Select **Build and deploy from a Git repository** and connect your repository.
3. Configure the following fields:
   - **Name**: `ykb-backend`
   - **Region**: Choose closest to your users (e.g., `Frankfurt` or `Oregon`)
   - **Root Directory**: `backend` (leave empty if deploying directly from the `ykb_server` repo)
   - **Environment**: `Node`
   - **Plan**: `Free`
   - **Build Command**:
     ```bash
     npm install && npx prisma migrate deploy && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Health Check Path**: `/health`

---

## 3. Environment Variables to Set in Render

Under the **Environment** tab in your Render service settings, add the following variables:

| Variable | Description | Example / Required |
|---|---|---|
| `NODE_ENV` | Environment mode | `production` |
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://...` (Supabase / Neon / Render Postgres) |
| `DIRECT_URL` | Direct connection URL (if using connection pooling) | Optional (Recommended for Supabase) |
| `JWT_SECRET` | Secret key for JWT signing | Minimum 16 characters string |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `your_api_secret` |
| `PLATFORM_FEE_BPS` | Platform fee in basis points | `0` |
| `CORS_ORIGIN` | Allowed CORS origins (wildcard or comma-separated) | `*` (or specific domain) |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:5173,https://kigalibespoke.com` |
| `PESAPAY_CONSUMER_KEY` | Pesapal Consumer Key | Required for payments |
| `PESAPAY_CONSUMER_SECRET` | Pesapal Consumer Secret | Required for payments |
| `PESAPAY_BASE_URL` | Pesapal API Endpoint | `https://pay.pesapal.com/v3` or sandbox |
| `PESAPAY_IPN_ID` | Pesapal IPN Notification ID | Required for webhook handling |
| `PESAPAY_CALLBACK_URL` | Callback URL after checkout | `https://your-frontend-domain.com/payment/callback` |

> [!NOTE]
> Render automatically sets `PORT=10000` which the backend config automatically recognizes.

---

## 4. Free Tier Considerations & Tips

1. **Spin Down on Inactivity**: Free instances spin down after ~15 minutes of inactivity. The first request after spin-down may take ~30–50 seconds to warm up.
2. **Health Check**: Render pings `/health` to verify that your service is online before routing traffic.
3. **Database Migrations**: The build command runs `npx prisma migrate deploy` automatically before compiling TypeScript, ensuring your database schema is always up-to-date on each deploy.
