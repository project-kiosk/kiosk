import type { Alpha2Code, Alpha3Code, Language, LanguageName } from '$lib/language';
import { getLanguageByAlpha2Code, getLanguageByAlpha3Code, getLanguageByName } from '$lib/language';
import { XMLParser } from 'fast-xml-parser';

export interface EpubFile
  extends Omit<File, 'prototype' | 'webkitRelativePath' | 'slice' | 'stream'>
{
}

export interface Metadata extends Record<string, any>
{
  author: string;
  cover: string;
  date: Date;
  description: string;
  doi: string;
  isbn: string;
  jdcn: string;
  language: string;
  genre: string;
  publisher: string;
  rights: string;
  title: string;
  uuid: string;
}

export interface BookData
{
  coverFile?: EpubFile;
  files: EpubFile[];
  metadata: Partial<Metadata>;
}

export async function parse( files: EpubFile[] ): Promise<BookData> {
  const metaDataFile = files.find( ( { name } ) => name.endsWith( ".opf" ) );

  if ( !metaDataFile ) {
    throw new Error( "Invalid EPUB file: Missing OPF manifest" );
  }

  const xml       = new XMLParser( {
    ignoreAttributes: false,
    allowBooleanAttributes: true,
    trimValues: true,
    alwaysCreateTextNode: true,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    processEntities: true,
    ignoreDeclaration: true,
    parseTagValue: true,
    parseAttributeValue: true
  } );
  const content   = await metaDataFile.text();
  const result    = xml.parse( content );
  const metadata  = parseMetadata( result.package.metadata || {} );
  const coverFile = determineCoverFile( files, metadata.cover );

  return {
    files,
    coverFile,
    metadata
  };
}

function parseMetadata( document: XmlDocument ): Partial<Metadata> {
  const props: Partial<Metadata>          = {};
  const metaProps: Record<string, string> = Array.isArray( document.meta )
                                            ? document.meta.reduce( ( carry, item ) => {
      return {
        ...carry,
        [ item[ "@_name" ] ]: item[ "@_content" ]
      };
    }, {} )
                                            : {};

  if ( document[ "dc:identifier" ] ) {
    const [ id, attrs ] = readXmlProp( document[ "dc:identifier" ] );

    // @ts-ignore
    switch ( attrs[ "opf:scheme" ] ) {
      case "uuid":
        props.uuid = id;
        break;

      case "isbn":
        props.isbn = id;
        break;

      case "doi":
        props.doi = id;
        break;

      case "jdcn":
        props.jdcn = id;
        break;
    }

    delete document[ "dc:identifier" ];
  }

  if ( document[ "dc:title" ] ) {
    const [ title ] = readXmlProp( document[ "dc:title" ] );
    props.title     = title;

    delete document[ "dc:title" ];
  }

  if ( document[ "dc:creator" ] ) {
    const [ author, attributes ] = readXmlProp( document[ "dc:creator" ] );

    // @ts-ignore
    if ( attributes[ "opf:role" ] && attributes[ "opf:role" ] === "aut" ) {
      props.author = author;
    }

    delete document[ "dc:creator" ];
  }

  if ( document[ "dc:publisher" ] ) {
    const [ publisher ] = readXmlProp( document[ "dc:publisher" ] );
    props.publisher     = publisher;

    delete document[ "dc:publisher" ];
  }

  if ( document[ "dc:rights" ] ) {
    const [ rights ] = readXmlProp( document[ "dc:rights" ] );
    props.rights     = rights;

    delete document[ "dc:rights" ];
  }

  if ( document[ "cover" ] ) {
    const [ cover ] = readXmlProp( document[ "cover" ] );
    props.cover     = cover;

    delete document[ "cover" ];
  }

  if ( document[ "dc:description" ] ) {
    const [ description ] = readXmlProp( document[ "dc:description" ] );
    props.description     = parseDescription( description );

    delete document[ "dc:description" ];
  }

  if ( document[ "dc:date" ] ) {
    const [ date ] = readXmlProp( document[ "dc:date" ] );
    props.date     = parsePublishingDate( date );

    delete document[ "dc:date" ];
  }

  if ( document[ "dc:language" ] ) {
    const [ language ] = readXmlProp( document[ "dc:language" ] );
    props.language     = parseLanguage( language );

    delete document[ "dc:language" ];
  }

  if ( document[ "dc:type" ] ) {
    const [ type ] = readXmlProp( document[ "dc:type" ] );
    props.genre    = type;

    delete document[ "dc:type" ];
  }

  return {
    ...Object.fromEntries(
      Object.entries( document )

      // Filter the meta prop and assert the result type
            .filter( ( attribute ): attribute is [ string, XmlNode ] => attribute[ 0 ] !== "meta" )

            .filter( ( [ name ] ) => !name.startsWith( "@_xmlns:" ) )

      // Map all other properties to their content, ignoring the attributes
            .map( ( [ key, value ] ) => [ key, value[ "#text" ] || "" ] )
    ),
    ...metaProps,

    // By merging the identified props last, they will override any accidental
    // meta properties with the same name
    ...props
  };
}

function parseDescription( description: string | undefined ): string | undefined {
  if ( !description ) {
    return undefined;
  }

  // Convert the description HTML to markdown
  try {
    // TODO: Find a way to sanitize async
    return description.trim();
  } catch ( error ) {
    console.error( `Could not convert description: ${ ( error as Error ).message }` );
  }

  return description;
}

function parsePublishingDate( publishingDate: string | undefined ): Date | undefined {
  return publishingDate ? new Date( publishingDate ) : undefined;
}

function parseLanguage( language: string | undefined ): Alpha2Code | undefined {
  if ( !language ) {
    return undefined;
  }

  let existing: Language | undefined;

  if ( language.length === 2 ) {
    existing = getLanguageByAlpha2Code( language as Alpha2Code );
  } else if ( language.length === 3 ) {
    existing = getLanguageByAlpha3Code( language as Alpha3Code );
  } else {
    existing = getLanguageByName( language as LanguageName );
  }

  return existing?.alpha2;
}

function readXmlProp<T extends XmlNode>(
  attributes: T | string | undefined
): [
  string,
  Record<keyof T extends string ? removePrefix<keyof T, "@_"> : keyof T, string | boolean>
] {
  if ( !attributes || typeof attributes === "string" ) {
    return [ attributes || "", {} as Record<keyof T, string | boolean> ];
  }

  const content = attributes[ "#text" ] || "";

  const props = Object.fromEntries(
    Object.entries( attributes )
          .filter( ( [ attribute ] ) => attribute !== "#text" )
          .map( ( [ key, value ] ) => [ key.replace( /^@_/, "" ), value ] )
          .filter( ( [ , value ] ) => typeof value !== "undefined" )
  );

  return [ content, props ];
}

function determineCoverFile( files: EpubFile[], coverFilename?: string ): EpubFile | undefined {
  return files.find( ( file ) => {
    const fileName  = ( file.name.split( "/" ).pop() || file.name ).toLowerCase();
    const extension = file.name.split( "." ).pop() || "";

    return (
      // 1. cover matches filename
      fileName === coverFilename ||
      // 2. no cover set, found image file
      ( !coverFilename && [ "jpg", "jpeg", "png" ].includes( extension ) ) ||
      // 3. cover doesn't contain file extension but matching image file found
      [ coverFilename + ".jpg", coverFilename + ".jpeg", coverFilename + ".png" ].includes(
        fileName
      ) ||
      // 4. no cover, but found filename containing "cover" and image extension
      ( fileName.startsWith( "cover" ) && [ "jpg", "jpeg", "png" ].includes( extension ) )
    );
  } );
}

export type addPrefix<
  TKey,
  TPrefix extends string
> = TKey extends string ? `${ TPrefix }${ TKey }` : never;

export type removePrefix<
  TPrefixedKey,
  TPrefix extends string
> = TPrefixedKey extends addPrefix<infer TKey, TPrefix> ? TKey : "";
type XmlDocumentAttributeKey = addPrefix<string, "@_">;

export type XmlNode = Partial<Record<string, string | boolean>> & {
  [ attribute: XmlDocumentAttributeKey ]: string | boolean;
  "#text"?: string;
};

type XmlMetaAttributes = XmlNode & {
  "@_content": string;
  "@_name": string;
};

type Contributor = "aut" | "edt" | "ill" | "nrt" | "red" | "trl" | "bkp" | "bkd";
type IdentifierScheme = "doi" | "isbn" | "jdcn" | "uuid";

export type XmlDocument = Record<string, XmlNode> & {
  meta?: XmlMetaAttributes[];

  "dc:creator"?: XmlNode & {
    "@_opf:role": Contributor;
    "@_opf:file-as"?: string;
  };
  "dc:contributor"?: XmlNode & {
    "@_opf:role": Contributor;
    "@_opf:file-as"?: string;
  };
  "dc:publisher"?: string | ( XmlNode & { "#text": string } );
  "dc:identifier"?: XmlNode & {
    "@_opf:scheme": IdentifierScheme;
    "@id"?: string;
  };
  "dc:title"?: string | ( XmlNode & { "#text": string } );
  "dc:date"?: string | ( XmlNode & { "#text": string } );
  "dc:description"?: string | ( XmlNode & { "#text": string } );
  "dc:language"?: string | ( XmlNode & { "#text": string } );
  "dc:type"?: string | ( XmlNode & { "#text": string } );
  "dc:rights"?: string | ( XmlNode & { "#text": string } );
  "dc:source"?: string | ( XmlNode & { "#text": string } );
  "dc:format"?: string | ( XmlNode & { "#text": string } );
  "dc:subject"?: string | ( XmlNode & { "#text": string } );
  "dc:relation"?: string | ( XmlNode & { "#text": string } );
  "dc:coverage"?: string | ( XmlNode & { "#text": string } );
};
