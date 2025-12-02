# Cloudflare D1 Integration

## 1) Deploy Worker
- Install wrangler: `npm i -g wrangler`
- `cd cloudflare-worker`
- Update `wrangler.toml` `database_id` to your D1 id.
- Create DB: `wrangler d1 create tp_pc_builder`
- Apply schema: `wrangler d1 execute tp_pc_builder --file=schema.sql`
- Dev: `wrangler dev`
- Deploy: `wrangler deploy`

## 2) Configure React
- In `react-pc-builder`, set env: `VITE_API_BASE=https://<your-worker-url>`
- Restart dev server.

## 3) Editing
- Toggle "Chế độ chỉnh sửa" in Kho linh kiện → nhập mật khẩu `namhbcf12` → chỉnh sửa giá/số lượng/thêm/xóa. Changes are saved to D1.





