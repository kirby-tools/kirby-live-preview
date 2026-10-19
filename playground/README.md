# Playground

Two modes, switched by `KIRBY_DEBUG` in the root `.env`:

- **Shared demo** (`false`): no frontend, every URL goes to the Panel, `/panel/login` signs in the `playground` role, changes are never written. The preview section still renders, since it renders pages through the plugin's API.
- **Local testing** (`true`): pages render under `/`, `/panel/login` signs in as admin, `/panel/login?role=playground` as the role of the shared demo, which may edit pages and the site but not create, move or delete them.

`composer dev` serves it on `localhost:8000`. The admin account `admin@example.com` has no password; only the login route signs it in.
