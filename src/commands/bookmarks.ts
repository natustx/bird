import type { Command } from 'commander';
import type { CliContext } from '../cli/shared.js';
import { extractBookmarkFolderId } from '../lib/extract-bookmark-folder-id.js';
import { TwitterClient } from '../lib/twitter-client.js';

export function registerBookmarksCommand(program: Command, ctx: CliContext): void {
  program
    .command('bookmarks')
    .description('Get your bookmarked tweets')
    .option('-n, --count <number>', 'Number of bookmarks to fetch', '20')
    .option('--folder-id <id>', 'Bookmark folder (collection) id')
    .option('--json', 'Output as JSON')
    .option('--json-full', 'Output as JSON with full raw API response in _raw field')
    .action(async (cmdOpts: { count?: string; json?: boolean; jsonFull?: boolean; folderId?: string }) => {
      const opts = program.opts();
      const timeoutMs = ctx.resolveTimeoutFromOptions(opts);
      const count = Number.parseInt(cmdOpts.count || '20', 10);

      const { cookies, warnings } = await ctx.resolveCredentialsFromOptions(opts);

      for (const warning of warnings) {
        console.error(`${ctx.p('warn')}${warning}`);
      }

      if (!cookies.authToken || !cookies.ct0) {
        console.error(`${ctx.p('err')}Missing required credentials`);
        process.exit(1);
      }

      const client = new TwitterClient({ cookies, timeoutMs });
      const folderId = cmdOpts.folderId ? extractBookmarkFolderId(cmdOpts.folderId) : null;
      if (cmdOpts.folderId && !folderId) {
        console.error(`${ctx.p('err')}Invalid --folder-id. Expected numeric ID or https://x.com/i/bookmarks/<id>.`);
        process.exit(1);
      }
      const includeRaw = cmdOpts.jsonFull ?? false;
      const result = folderId
        ? await client.getBookmarkFolderTimeline(folderId, count, { includeRaw })
        : await client.getBookmarks(count, { includeRaw });

      if (result.success && result.tweets) {
        const emptyMessage = folderId ? 'No bookmarks found in folder.' : 'No bookmarks found.';
        ctx.printTweets(result.tweets, { json: cmdOpts.json || cmdOpts.jsonFull, emptyMessage });
      } else {
        console.error(`${ctx.p('err')}Failed to fetch bookmarks: ${result.error}`);
        process.exit(1);
      }
    });
}
