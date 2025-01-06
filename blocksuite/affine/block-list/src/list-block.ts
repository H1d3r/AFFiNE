import '@blocksuite/affine-shared/commands';

import { CaptionedBlockComponent } from '@blocksuite/affine-components/caption';
import { playCheckAnimation } from '@blocksuite/affine-components/icons';
import {
  DefaultInlineManagerExtension,
  type RichText,
} from '@blocksuite/affine-components/rich-text';
import { TOGGLE_BUTTON_PARENT_CLASS } from '@blocksuite/affine-components/toggle-button';
import type { ListBlockModel } from '@blocksuite/affine-model';
import {
  BLOCK_CHILDREN_CONTAINER_PADDING_LEFT,
  NOTE_SELECTOR,
} from '@blocksuite/affine-shared/consts';
import { DocModeProvider } from '@blocksuite/affine-shared/services';
import { getViewportElement } from '@blocksuite/affine-shared/utils';
import type { BaseSelection, BlockComponent } from '@blocksuite/block-std';
import {
  BlockSelection,
  getInlineRangeProvider,
  TextSelection,
} from '@blocksuite/block-std';
import type { InlineRangeProvider } from '@blocksuite/inline';
import { effect } from '@preact/signals-core';
import { html, nothing, type TemplateResult } from 'lit';
import { query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';

import { correctNumberedListsOrderToPrev } from './commands/utils.js';
import { listBlockStyles } from './styles.js';
import { getListIcon } from './utils/get-list-icon.js';

export class ListBlockComponent extends CaptionedBlockComponent<ListBlockModel> {
  static override styles = listBlockStyles;

  private _inlineRangeProvider: InlineRangeProvider | null = null;

  private readonly _onClickIcon = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (this.model.type === 'toggle') {
      if (this.doc.readonly) {
        this._readonlyCollapsed = !this._readonlyCollapsed;
      } else {
        this.doc.captureSync();
        this.doc.updateBlock(this.model, {
          collapsed: !this.model.collapsed,
        });
      }

      return;
    } else if (this.model.type === 'todo') {
      if (this.doc.readonly) return;

      this.doc.captureSync();
      const checkedPropObj = { checked: !this.model.checked };
      this.doc.updateBlock(this.model, checkedPropObj);
      if (this.model.checked) {
        const checkEl = this.querySelector('.affine-list-block__todo-prefix');
        if (checkEl) {
          playCheckAnimation(checkEl).catch(console.error);
        }
      }
      return;
    }
    this._select();
  };

  get attributeRenderer() {
    return this.inlineManager.getRenderer();
  }

  get attributesSchema() {
    return this.inlineManager.getSchema();
  }

  get embedChecker() {
    return this.inlineManager.embedChecker;
  }

  get inlineManager() {
    return this.std.get(DefaultInlineManagerExtension.identifier);
  }

  get markdownShortcutHandler() {
    return this.inlineManager.markdownShortcutHandler;
  }

  override get topContenteditableElement() {
    if (this.std.get(DocModeProvider).getEditorMode() === 'edgeless') {
      return this.closest<BlockComponent>(NOTE_SELECTOR);
    }
    return this.rootComponent;
  }

  private _select() {
    const selection = this.host.selection;
    selection.update(selList => {
      return selList
        .filter<BaseSelection>(
          sel => !sel.is(TextSelection) && !sel.is(BlockSelection)
        )
        .concat(selection.create(BlockSelection, { blockId: this.blockId }));
    });
  }

  override connectedCallback() {
    super.connectedCallback();

    this._inlineRangeProvider = getInlineRangeProvider(this);

    this.disposables.add(
      effect(() => {
        const collapsed = this.model.collapsed$.value;
        this._readonlyCollapsed = collapsed;
      })
    );

    this.disposables.add(
      effect(() => {
        const type = this.model.type$.value;
        const order = this.model.order$.value;
        // old numbered list has no order
        if (type === 'numbered' && !Number.isInteger(order)) {
          correctNumberedListsOrderToPrev(this.doc, this.model, false);
        }
        // if list is not numbered, order should be null
        if (type !== 'numbered' && order !== null) {
          this.model.order = null;
        }
      })
    );
  }

  override async getUpdateComplete() {
    const result = await super.getUpdateComplete();
    await this._richTextElement?.updateComplete;
    return result;
  }

  override renderBlock(): TemplateResult<1> {
    const { model, _onClickIcon } = this;
    const collapsed = this.doc.readonly
      ? this._readonlyCollapsed
      : model.collapsed;

    const listIcon = getListIcon(model, !collapsed, _onClickIcon);

    const children = html`<div
      class="affine-block-children-container"
      style=${styleMap({
        paddingLeft: `${BLOCK_CHILDREN_CONTAINER_PADDING_LEFT}px`,
        display: collapsed ? 'none' : undefined,
      })}
    >
      ${this.renderChildren(this.model)}
    </div>`;

    return html`
      <div class=${'affine-list-block-container'}>
        <div
          class=${classMap({
            'affine-list-rich-text-wrapper': true,
            'affine-list--checked':
              this.model.type === 'todo' && this.model.checked,
            [TOGGLE_BUTTON_PARENT_CLASS]: true,
          })}
        >
          ${this.model.children.length > 0
            ? html`
                <blocksuite-toggle-button
                  .collapsed=${collapsed}
                  .updateCollapsed=${(value: boolean) => {
                    if (this.doc.readonly) {
                      this._readonlyCollapsed = value;
                    } else {
                      this.doc.captureSync();
                      this.doc.updateBlock(this.model, {
                        collapsed: value,
                      });
                    }
                  }}
                ></blocksuite-toggle-button>
              `
            : nothing}
          ${listIcon}
          <rich-text
            .yText=${this.model.text.yText}
            .inlineEventSource=${this.topContenteditableElement ?? nothing}
            .undoManager=${this.doc.history}
            .attributeRenderer=${this.attributeRenderer}
            .attributesSchema=${this.attributesSchema}
            .markdownShortcutHandler=${this.markdownShortcutHandler}
            .embedChecker=${this.embedChecker}
            .readonly=${this.doc.readonly}
            .inlineRangeProvider=${this._inlineRangeProvider}
            .enableClipboard=${false}
            .enableUndoRedo=${false}
            .verticalScrollContainerGetter=${() =>
              getViewportElement(this.host)}
          ></rich-text>
        </div>

        ${children}
      </div>
    `;
  }

  @state()
  private accessor _readonlyCollapsed = false;

  @query('rich-text')
  private accessor _richTextElement: RichText | null = null;

  override accessor blockContainerStyles = {
    margin: 'var(--affine-list-margin, 10px 0)',
  };
}
