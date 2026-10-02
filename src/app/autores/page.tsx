import Image from "next/image";
import Link from "next/link";
import { listAuthors, getBooksByAuthor } from "@/lib/catalog";
import { PageHero } from "@/components/ui/page-hero";
import { employmentLabel } from "@/lib/professional";

export const metadata = { title: "Perfil de Profissionais do sector em Angola" };

export default async function AuthorsPage() {
  const authors = await listAuthors();

  return (
    <>
      <PageHero
        eyebrow="Comunidade"
        title="Perfil de Profissionais do sector em Angola"
        description="Especialistas | Consultores | Coordenadores | Directores | Analistas | Supervisores | Técnicos | Auxiliares da Cadeia Logística em Angola"
      />
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {await Promise.all(
            authors.map(async (author) => {
              const bookCount = (await getBooksByAuthor(author.id)).length;
              const status = employmentLabel(author.employmentStatus);
              return (
                <Link
                  key={author.id}
                  href={`/autores/${author.slug}`}
                  className="surface-card surface-card-hover flex gap-6 p-6"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full ring-2 ring-mesclar-border">
                    <Image src={author.photoUrl} alt="" fill className="object-cover" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{author.name}</h2>
                    <p className="text-sm text-mesclar-gold-dark">{author.specialty}</p>
                    {status && (
                      <span className="mt-2 inline-block rounded-full bg-mesclar-black px-2.5 py-0.5 text-[11px] font-semibold text-mesclar-gold-light">
                        {status}
                      </span>
                    )}
                    <p className="mt-2 line-clamp-2 text-sm text-mesclar-muted">{author.bio}</p>
                    <p className="mt-2 text-xs font-medium">{bookCount} livro(s)</p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
