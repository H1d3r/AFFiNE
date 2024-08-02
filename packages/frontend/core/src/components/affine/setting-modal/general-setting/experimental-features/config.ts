import type { AppSetting } from '@toeverything/infra';

export type BuildChannel = 'stable' | 'beta' | 'canary' | 'internal';

export type FeedbackType = 'discord' | 'email' | 'github';

export type Flag<K extends string> = Partial<{
  [key in K]: {
    displayName: string;
    displayChannel: BuildChannel[];
    description?: string;
    feedbackType?: FeedbackType;
    restrictedPlatform?: 'client' | 'web';
  };
}>;

// feature flag -> display name
export const blocksuiteFeatureFlags: Flag<keyof BlockSuiteFlags> = {
  enable_expand_database_block: {
    displayName: 'Enable Expand Database Block',
    description:
      'Allows expanding database blocks for better view and management.',
    displayChannel: ['stable', 'beta', 'canary', 'internal'],
  },
  enable_database_attachment_note: {
    displayName: 'Enable Database Attachment Note',
    description: 'Allows adding notes to database attachments.',
    displayChannel: ['stable', 'beta', 'canary', 'internal'],
  },
  enable_database_statistics: {
    displayName: 'Enable Database Block Statistics',
    description: 'Shows statistics for database blocks.',
    displayChannel: ['stable', 'beta', 'canary', 'internal'],
  },
  enable_block_query: {
    displayName: 'Enable Todo Block Query',
    description: 'Enables querying of todo blocks.',
    displayChannel: ['stable', 'beta', 'canary', 'internal'],
  },
};

export const affineFeatureFlags: Flag<keyof AppSetting> = {
  enableMultiView: {
    displayName: 'Split View',
    description:
      'The Split View feature in AFFiNE allows users to divide their workspace into multiple sections, enabling simultaneous viewing and editing of different documents.The Split View feature in AFFiNE allows users to divide their workspace into multiple sections, enabling simultaneous viewing and editing of different documents.',
    displayChannel: ['stable', 'beta', 'canary', 'internal'],
    feedbackType: 'discord',
    restrictedPlatform: 'client',
  },
};
