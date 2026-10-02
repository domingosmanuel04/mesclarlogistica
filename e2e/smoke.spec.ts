import { test, expect } from "@playwright/test";

test.describe("Mesclar smoke", () => {
  test("home and catalog load", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Mesclar/i);
    await page.goto("/ebooks");
    await expect(page.getByText(/título/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("health endpoint", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.status).toBe("healthy");
  });

  test("free ebook download API", async ({ request }) => {
    const catalog = await request.get("/api/catalog");
    const books = await catalog.json();
    const free = books.find((b: { priceEbook: number }) => b.priceEbook === 0);
    expect(free).toBeTruthy();
    const dl = await request.post("/api/books/free-download", {
      data: { bookId: free.id },
    });
    expect(dl.ok()).toBeTruthy();
    const body = await dl.json();
    expect(body.downloadToken).toBeTruthy();
  });

  test("login page and demo hint", async ({ page }) => {
    await page.goto("/entrar");
    await expect(page.getByRole("heading", { name: /entrar/i })).toBeVisible();
    await expect(page.getByText(/vendedor@mesclar.ao/i)).toBeVisible();
  });
});
