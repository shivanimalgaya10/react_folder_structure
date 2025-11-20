/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';

import Editor from '@monaco-editor/react';
import { Card, Tooltip } from '@mui/material';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { motion } from 'framer-motion';
import { AiOutlineLoading } from 'react-icons/ai';
import {
    FaBold,
    FaItalic,
    FaUnderline,
    FaLink,
    FaImage,
    FaHeading,
    FaListUl,
    FaListOl,
    FaAlignLeft,
    FaAlignRight,
    FaAlignCenter
} from 'react-icons/fa';
import { LuCodeXml } from 'react-icons/lu';
import { toast } from 'react-toastify';
import ImageResize from 'tiptap-extension-resize-image';

import { Button, Select } from '@/components/ui';
import {
    convertBlockStyleToSpan,
    convertStyleTagToInline,
    CustomEnterExtension,
    CustomParagraph,
    defaultStyles,
    extractImagesFromContent,
    InlineStyle
} from '@/utils';

import './GlobalEditor.css';

interface GlobalEditorProps {
  initialContent?: string;
  styles?: object;
  height?: string | number | undefined;
  showEditorInCard?: boolean;
  readOnly?: boolean;
  showBottomBtns?: boolean;
  buttonText?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onCancel?: () => void;
  onImageUpload?: (image: File) => void;
  imageUploadApi?: (image: File) => Promise<void>;
  imageDeleteApi?: (id: string) => Promise<void>;
  showDropdown?: boolean;
  dropdownOptions?: { label: string; value: string }[];
  onDropdownChange?: (val: string) => void;
  selectedDropdown?: string;
  generateFullHtml?: boolean;
  customStyles?: string;
}

const GlobalEditor: React.FC<GlobalEditorProps> = ({
    initialContent = '<p>Start writing...</p>',
    buttonText = 'Save',
    showEditorInCard = true,
    showBottomBtns = true,
    styles = {},
    height = '',
    onChange,
    onSubmit,
    onCancel,
    onImageUpload,
    imageUploadApi,
    imageDeleteApi,
    showDropdown = false,
    readOnly = false,
    dropdownOptions = [],
    onDropdownChange,
    selectedDropdown,
    generateFullHtml = false,
    customStyles = ''
}) => {
    // console.log('initialContent', initialContent);
    const [html, setHtml] = useState(initialContent || '');
    const [isHtmlView, setIsHtmlView] = useState(false);
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [currentImages, setCurrentImages] = useState<string[] | object[]>([]);

    const editor = useEditor({
        editable: !readOnly, 
        extensions: [
            StarterKit.configure({
                // Keep hard break enabled for Shift+Enter
                hardBreak: {
                    HTMLAttributes: {
                        class: 'hard-break'
                    }
                },
                paragraph: false
            }),
            CustomParagraph,
            CustomEnterExtension,
            ImageResize.configure({
                inline: false,
                allowBase64: true
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    rel: 'noopener noreferrer'
                }
            }),
            Underline,
            TextStyle,
            InlineStyle,
            Color
        ],
        content: initialContent,
        onUpdate: ({ editor }) => {
            if (readOnly) return;
            const updatedHtml = editor.getHTML();

            let finalHtml = updatedHtml;

            // Generate full HTML document if requested
            if (generateFullHtml) {
                finalHtml = `<!DOCTYPE html><html lang="en">
                    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title>
                    <style>${defaultStyles}${customStyles}</style></head>
                    <body>${updatedHtml}</body></html>`;
            }

            setHtml(finalHtml);
            onChange?.(finalHtml);

            const json = editor.getJSON();
            const newImages = extractImagesFromContent(json as { content: never[] });

            // Create arrays of image sources for comparison
            const newImageSources = newImages.map(img => img.src);

            // Find removed images by comparing current vs new
            const removedImages = currentImages.filter(currentImg => {
                const currentSrc =
          typeof currentImg === 'string'
              ? currentImg
              : (currentImg as { src: string })?.src ||
              (currentImg as { file_url: string })?.file_url;
                return !newImageSources.includes(currentSrc);
            });

            // Call delete API for removed images
            if (removedImages.length > 0) {
                console.warn('Images removed:', removedImages);

                removedImages.forEach(async removedImg => {
                    try {
                        if (imageDeleteApi && (removedImg as { id: string })?.id) {
                            await imageDeleteApi((removedImg as { id: string })?.id);
                        }
                        console.warn(
                            'Successfully deleted image:',
                            (removedImg as { id: string })?.id
                        );
                    } catch (err) {
                        console.error('Failed to delete image:', err);
                        // Optionally show a toast notification
                        if (typeof toast !== 'undefined') {
                            toast.error('Failed to delete image from server');
                        }
                    }
                });
            }

            // Update current images state
            setCurrentImages(newImages);
        }
    });

    const handleToggleHtmlView = () => {
        if (isHtmlView && editor) {
            const cleanHtml = convertBlockStyleToSpan(convertStyleTagToInline(html));
            editor.commands.setContent(cleanHtml); // Set back the HTML
        }
        setIsHtmlView(!isHtmlView);
    };

    const handleSaveHtml = () => {
        if (editor) {
            const cleanHtml = convertBlockStyleToSpan(convertStyleTagToInline(html));
            editor.commands.setContent(cleanHtml);
            setIsHtmlView(false);
        }
    };

    const addImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            onImageUpload?.(file);
            if (!/^image\//.test(file.type))
                return toast.error('Only image files allowed.');
            if (imageUploadApi) {
                try {
                    setIsImageUploading(true);
                    const data = (await imageUploadApi(file)) as unknown as {
            id: string;
            file_url: string;
          };

                    if (!data?.file_url) throw new Error('Upload failed');
                    const imageAttrs = {
                        src: data?.file_url,
                        title: data?.id
                    };

                    editor?.chain().focus().setImage(imageAttrs).run();

                    // Add to currentImages list manually (onUpdate will also catch this)
                    const imageData = {
                        src: data?.file_url,
                        ...data
                    };
                    setCurrentImages(prev => [...prev, imageData] as object[]);
                    setIsImageUploading(false);
                } catch (err) {
                    console.error('err', err);
                    toast.error('Failed to upload image');
                    setIsImageUploading(false);
                }
            } else {
                try {
                    const url = URL.createObjectURL(file); // simulate upload
                    // console.log('url', url);
                    const tempImageData = {
                        src: url,
                        title: null,
                        id: null, // Use URL as ID for local images
                        isLocal: true
                    };

                    editor
                        ?.chain()
                        .focus()
                        .setImage({
                            src: url,
                            title: url
                        })
                        .run();

                    setCurrentImages(prev => [...prev, tempImageData] as string[]);
                } catch (err) {
                    console.error('err', err);
                    toast.error('Failed to upload image');
                }
            }
        };

        input.click();
    };

    // Fixed list toggle function - only affects current paragraph
    const toggleList = (type: 'bulletList' | 'orderedList') => {
        if (!editor) return;

        const { state } = editor;
        const { selection } = state;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { $from, $to } = selection;
        // If there's a selection, we need to handle it differently
        if (!selection.empty) {
            // For selected text, just use the built-in toggle
            if (type === 'bulletList') {
                editor.chain().focus().toggleBulletList().run();
            } else {
                editor.chain().focus().toggleOrderedList().run();
            }
            return;
        }
        // For cursor position, ensure we only affect the current paragraph
        const currentPos = $from.pos;
        // Check if we're already in a list
        const isInList = editor.isActive('bulletList') || editor.isActive('orderedList');
        if (isInList) {
            // If already in a list, toggle it off
            if (type === 'bulletList') {
                editor.chain().focus().toggleBulletList().run();
            } else {
                editor.chain().focus().toggleOrderedList().run();
            }
        } else {
            // Create list for current paragraph only
            const paragraphStart = $from.start($from.depth);
            const paragraphEnd = $from.end($from.depth);
            // Select just the current paragraph
            editor.chain().focus().setTextSelection({ from: paragraphStart, to: paragraphEnd }).run();
            // Apply the list
            if (type === 'bulletList') {
                editor.chain().toggleBulletList().run();
            } else {
                editor.chain().toggleOrderedList().run();
            }
            // Restore cursor position
            editor.chain().focus().setTextSelection(currentPos).run();
        }
    };

    useEffect(() => {
        if (editor && initialContent) {
            editor.commands.setContent(initialContent);
        }
    }, [initialContent, editor]);

    if (!editor) return null;

    return (
        <>
            <RenderEditor isCard={showEditorInCard}>
                {showDropdown && dropdownOptions.length > 0 && (
                    <div className="w-50 mb-3">
                        <Select
                            value={selectedDropdown || ''}
                            onChange={onDropdownChange}
                            options={dropdownOptions}
                        />
                    </div>
                )}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        height: '100%'
                    }}
                >
                    <div style={{ flex: 1, width: '100%' }}>
                        {readOnly ? <div className="editor-toolbar">
                            <button
                                className={`toolbar-btn ${
                                    editor.isActive('bold') ? 'is-active' : ''
                                }`}
                            >Template Content</button>
                        </div> : <div className="editor-toolbar">
                            <button
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                className={`toolbar-btn ${
                                    editor.isActive('bold') ? 'is-active' : ''
                                }`}
                            >
                                <FaBold />
                            </button>
                            <button
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                className={`toolbar-btn ${
                                    editor.isActive('italic') ? 'is-active' : ''
                                }`}
                            >
                                <FaItalic />
                            </button>
                            <button
                                onClick={() => editor.chain().focus().toggleUnderline().run()}
                                className={`toolbar-btn ${
                                    editor.isActive('underline') ? 'is-active' : ''
                                }`}
                            >
                                <FaUnderline />
                            </button>
                            <Tooltip title="Insert Link" placement="top">
                                <button
                                    onClick={() => {
                                        const url = prompt('Enter link URL');
                                        if (url)
                                            editor.chain().focus().setLink({ href: url }).run();
                                    }}
                                    className="toolbar-btn"
                                >
                                    <FaLink />
                                </button>
                            </Tooltip>
                            {currentImages?.length === 0 ? (
                                <button onClick={addImage} className="toolbar-btn">
                                    <FaImage />
                                </button>
                            ) : null}
                            <div className="toolbar-select-wrapper">
                                <span className="select-icon">
                                    <FaHeading />
                                </span>
                                <select
                                    onChange={e => {
                                        const level = parseInt(e.target.value) as never;
                                        if (level)
                                            editor.chain().focus().toggleHeading({ level }).run();
                                        else editor.chain().focus().setParagraph().run();
                                    }}
                                    className="toolbar-select"
                                >
                                    <option hidden value="">
                    Heading
                                    </option>
                                    <option value="">Normal</option>
                                    <option value="1">H1</option>
                                    <option value="2">H2</option>
                                    <option value="3">H3</option>
                                </select>
                            </div>
                            <button
                                onClick={() => {
                                    editor
                                        .chain()
                                        .focus()
                                        .updateAttributes('paragraph', {
                                            textAlign: 'left'
                                        })
                                        .run();
                                }}
                                className={`toolbar-btn ${
                                    editor.isActive('paragraph', { textAlign: 'left' })
                                        ? 'is-active'
                                        : ''
                                }`}
                            >
                                <FaAlignLeft />
                            </button>

                            <button
                                onClick={() => {
                                    editor
                                        .chain()
                                        .focus()
                                        .updateAttributes('paragraph', {
                                            textAlign: 'center'
                                        })
                                        .run();
                                }}
                                className={`toolbar-btn ${
                                    editor.isActive('paragraph', { textAlign: 'center' })
                                        ? 'is-active'
                                        : ''
                                }`}
                            >
                                <FaAlignCenter />
                            </button>

                            <button
                                onClick={() => {
                                    editor
                                        .chain()
                                        .focus()
                                        .updateAttributes('paragraph', {
                                            textAlign: 'right'
                                        })
                                        .run();
                                }}
                                className={`toolbar-btn ${
                                    editor.isActive('paragraph', { textAlign: 'right' })
                                        ? 'is-active'
                                        : ''
                                }`}
                            >
                                <FaAlignRight />
                            </button>
                            <Tooltip title="Bullet List" placement="top">
                                <button
                                    onClick={() => toggleList('bulletList')}
                                    className={`toolbar-btn ${
                                        editor.isActive('bulletList') ? 'is-active' : ''
                                    }`}
                                >
                                    <FaListUl />
                                </button>
                            </Tooltip>

                            <Tooltip title="Number List" placement="top">
                                <button
                                    onClick={() => toggleList('orderedList')}
                                    className={`toolbar-btn ${
                                        editor.isActive('orderedList') ? 'is-active' : ''
                                    }`}
                                >
                                    <FaListOl />
                                </button>
                            </Tooltip>
                            
                            <Tooltip title="Text color" placement="top">
                                <input
                                    type="color"
                                    onChange={e =>
                                        editor.chain().focus().setColor(e.target.value).run()
                                    }
                                    defaultValue={editor.getAttributes('textStyle').color}
                                    className="toolbar-color-picker"
                                />
                            </Tooltip>

                            {isHtmlView ? (
                                <button className={'toolbar-btn'} onClick={handleSaveHtml}>
                  Save
                                </button>
                            ) : (
                                <Tooltip title="HTML Source code" placement="top">
                                    <button
                                        className={'toolbar-btn'}
                                        onClick={handleToggleHtmlView}
                                    >
                                        <LuCodeXml />
                                    </button>
                                </Tooltip>
                            )}
                        </div>}

                        {!isHtmlView && editor ? (
                            <div
                                className="editor-content-area p_relative"
                                style={{ ...styles, height, borderTop: 'none' }}
                            >
                                <>
                                    <EditorContent
                                        style={styles}
                                        height={height}
                                        editor={editor}
                                        readOnly={readOnly}
                                        className="tiptap-editor"
                                    />
                                    {isImageUploading ? (
                                        <div className="image_upload_loading">
                                            <div className="d-flex flex-column align-items-center gap-3">
                                                <AiOutlineLoading className="loader-icon" />
                                                <small>Uploading Image</small>
                                            </div>
                                        </div>
                                    ) : null}
                                </>
                            </div>
                        ) : (
                            <Editor
                                height={height || '480px'}
                                className="source_editor"
                                defaultLanguage="html"
                                theme="vs-dark"
                                value={html}
                                onChange={value => setHtml(value || '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    fontFamily: 'Fira Code, monospace',
                                    automaticLayout: true,
                                    lineNumbers: 'on'
                                }}
                            />
                        )}
                    </div>
                </div>
                {showBottomBtns ? <div className="d-flex align-items-end text-end justify-content-end gap-2">
                    <Button
                        buttonClass="mt-3 btn btn-secondary text-end"
                        onClick={() => onCancel?.()}
                    >
            Cancel
                    </Button>
                    <Button
                        buttonClass="mt-3 btn btn-primary text-end"
                        onClick={() => onSubmit?.(html || '')}
                    >
                        {buttonText || 'Save'}
                    </Button>
                </div> : null}
            </RenderEditor>
        </>
    );
};

export default GlobalEditor;

export const RenderEditor = ({ isCard, children }: { isCard: boolean; children: React.ReactNode; }) => {
    return isCard ? (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <Card
                className="shadow-sm mt-3"
                sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'var(--bg_white)',
                    border: 'var(--cmn_border)'
                }}
            >
                {children}
            </Card>
        </motion.div>
    ) : (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    );
};
