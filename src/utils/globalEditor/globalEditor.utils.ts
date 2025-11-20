import { Extension } from '@tiptap/core';
import Paragraph from '@tiptap/extension-paragraph';

// Extract image from html
export const extractImagesFromContent = (editorContent: { content: never[]; }) => {
    const images: { src: string; id: string; }[] = [];
        
    // Walk through the document to find all images
    const walkNode = (node: { type: string; attrs: { [x: string]: string; src: string; }; content: never[]; }) => {
        if (node.type === 'image' && node.attrs?.src) {
            images.push({
                src: node.attrs.src,
                id: node.attrs.title
            });
        }
            
        if (node.content) {
            node.content.forEach(walkNode);
        }
    };
        
    if (editorContent?.content) {
        editorContent.content.forEach(walkNode);
    }
        
    return images;
};

// Custom paragraph to handle inline style and css
export const CustomParagraph = Paragraph.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            textAlign: {
                default: null,
                parseHTML: element => element.style.textAlign || null,
                renderHTML: attributes => {
                    if (!attributes.textAlign) return {};
                    return {
                        style: `text-align: ${attributes.textAlign}`
                    };
                }
            },
            marginLeft: {
                default: null,
                parseHTML: element => element.style.marginLeft || null,
                renderHTML: attributes => {
                    if (!attributes.marginLeft) return {};
                    return {
                        style: `margin-left: ${attributes.marginLeft}`
                    };
                }
            }
        };
    }
});

// Custom extension to handle Enter key behavior
export const CustomEnterExtension = Extension.create({
    name: 'customEnter',
        
    addKeyboardShortcuts() {
        return {
            'Enter': () => {
                const { state, dispatch } = this.editor.view;
                const { selection } = state;
                const { $from } = selection;
                    
                // Check if we're in a list item
                const currentDepth = $from.depth;
                let isInList = false;
                    
                // Walk up the node tree to check for list items
                for (let i = currentDepth; i >= 0; i--) {
                    const node = $from.node(i);
                    if (node.type.name === 'listItem' || node.type.name === 'bulletList' || node.type.name === 'orderedList') {
                        isInList = true;
                        break;
                    }
                }
                    
                if (isInList) {
                    return false; // Let default list behavior handle this
                }
                    
                // For regular paragraphs, create a new paragraph
                const { tr } = state;
                    
                // Split the current node at cursor position
                const canSplit = tr.doc.resolve(selection.from).parent.type.name === 'paragraph';
                    
                if (canSplit) {
                    tr.split(selection.from);
                    if (dispatch) {
                        dispatch(tr);
                    }
                    return true;
                }
                    
                return false;
            },
            'Shift-Enter': () => {
                // Shift+Enter creates a hard line break within the same paragraph
                const { state, dispatch } = this.editor.view;
                // const { selection } = state;
                    
                if (dispatch) {
                    const hardBreak = state.schema.nodes.hardBreak.create();
                    const tr = state.tr.replaceSelectionWith(hardBreak);
                    dispatch(tr);
                }
                    
                return true;
            }
        };
    }
});

// Custom inline support for style and css
export const InlineStyle = Extension.create({
    name: 'inlineStyle',
      
    addGlobalAttributes() {
        return [
            {
                types: ['textStyle'],
                attributes: {
                    style: {
                        default: null,
                        parseHTML: element => element.getAttribute('style'),
                        renderHTML: attributes => {
                            return attributes.style ? { style: attributes.style } : {};
                        }
                    }
                }
            }
        ];
    }
});

export function convertBlockStyleToSpan(html: string) {
    const div = document.createElement('div');
    div.innerHTML = html;
    div.querySelectorAll('*').forEach(el => {
        const style = el.getAttribute('style');
        if (style && ['P', 'DIV'].includes(el.tagName)) {
            const span = document.createElement('span');
            span.setAttribute('style', style);
            span.innerHTML = el.innerHTML;
            el.innerHTML = '';
            el.appendChild(span);
            el.removeAttribute('style');
        }
    });
    return div.innerHTML;
}

export function convertStyleTagToInline(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
  
    const styleTag = div.querySelector('style');
    if (!styleTag) return html;
  
    const cssText = styleTag.innerHTML;
    const rules = cssText
        .split('}')
        .map(rule => rule.trim())
        .filter(Boolean)
        .map(rule => {
            const [selector, style] = rule.split('{').map(r => r.trim());
            return { selector, style };
        });
  
    rules.forEach(({ selector, style }) => {
        // Only convert class selectors (e.g., .btn)
        if (selector.startsWith('.')) {
            const className = selector.slice(1);
            div.querySelectorAll(`.${className}`).forEach(el => {
                const existing = el.getAttribute('style') || '';
                el.setAttribute('style', `${existing}${style}`);
                el.classList.remove(className); // optional: remove class after inlining
            });
        }
    });
  
    // Remove the <style> tag after processing
    styleTag.remove();
  
    return div.innerHTML;
}

export const defaultStyles = `
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 40px;
            color: #333;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 12px;
        }
        p {
            margin-bottom: 12px;
        }
        ul, ol {
            margin: 12px 0;
            padding-left: 24px;
        }
        li {
            margin-bottom: 6px;
        }
        a {
            color: #0066cc;
            text-decoration: none;
        }
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 12px 0;
        }
        .hard-break {
            display: block;
            content: "";
            margin-top: 0.5em;
        }`;