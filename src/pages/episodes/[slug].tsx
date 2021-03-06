import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import styles from './episode.module.scss'
import Image from 'next/image';
import Link from 'next/link';

type Episode = {
  id: string;
  title: string,
  thumbnail: string,
  members: string,
  publishedAt: string,
  url: string,
  description: string,
  duration: number,
  durationAsString: string
}

type EpisodeProps = {
  episode: Episode
}

export default function Episode({ episode }: EpisodeProps) {
  return (
    <div className={styles.episode}>
      <div className={styles.thumbnailContainer}>
        <button type="button">
          <Link href="/">
            <img src="/arrow-left.svg" alt="Voltar" />
          </Link>
        </button>
        <Image width={700} height={160} src={episode.thumbnail} objectFit="cover" />
        <button type="button">
          <img src="/play.svg" alt="Tocar episódio" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div className={styles.description} dangerouslySetInnerHTML={{ __html: episode.description }} />
    </div>
  )
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params;
  const { data } = await api.get(`/episodes/${slug}`);

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
    description: data.description,
    url: data.file.url,
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration))
  }

  return {
    props: {
      episode
    },
    revalidate: 60 * 60 * 24, //24 hours 
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 2,
      _sort: 'published_at',
      _order: 'desc'
    }
  });

  const paths = data.map(episode => {
    return {
      params: {
        slug: episode.id
      }
    }
  })

  return {
    paths,
    fallback: 'blocking'
  }
}
