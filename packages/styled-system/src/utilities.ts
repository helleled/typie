import { defineUtility, definePattern } from '@pandacss/dev';

export const utilities = {
  // Spacing utilities
  padding: defineUtility({
    values: 'spacing',
  }),
  paddingX: defineUtility({
    values: 'spacing',
    transform: (value) => ({
      paddingLeft: value,
      paddingRight: value,
    }),
  }),
  paddingY: defineUtility({
    values: 'spacing',
    transform: (value) => ({
      paddingTop: value,
      paddingBottom: value,
    }),
  }),
  margin: defineUtility({
    values: 'spacing',
  }),
  marginX: defineUtility({
    values: 'spacing',
    transform: (value) => ({
      marginLeft: value,
      marginRight: value,
    }),
  }),
  marginY: defineUtility({
    values: 'spacing',
    transform: (value) => ({
      marginTop: value,
      marginBottom: value,
    }),
  }),
  
  // Size utilities
  width: defineUtility({
    values: 'sizes',
  }),
  height: defineUtility({
    values: 'sizes',
  }),
  minWidth: defineUtility({
    values: 'sizes',
  }),
  minHeight: defineUtility({
    values: 'sizes',
  }),
  maxWidth: defineUtility({
    values: 'sizes',
  }),
  maxHeight: defineUtility({
    values: 'sizes',
  }),
  size: defineUtility({
    values: 'sizes',
    transform: (value) => ({
      width: value,
      height: value,
    }),
  }),
  maxSize: defineUtility({
    values: 'sizes',
    transform: (value) => ({
      maxWidth: value,
      maxHeight: value,
    }),
  }),
  minSize: defineUtility({
    values: 'sizes',
    transform: (value) => ({
      minWidth: value,
      minHeight: value,
    }),
  }),
  
  // Layout utilities
  display: defineUtility({
    values: {
      block: 'block',
      inline: 'inline',
      'inline-block': 'inline-block',
      flex: 'flex',
      'inline-flex': 'inline-flex',
      grid: 'grid',
      'inline-grid': 'inline-grid',
      hidden: 'none',
    },
  }),
  
  // Typography utilities
  fontSize: defineUtility({
    values: 'fontSizes',
  }),
  fontWeight: defineUtility({
    values: 'fontWeights',
  }),
  lineHeight: defineUtility({
    values: 'lineHeights',
  }),
  fontFamily: defineUtility({
    values: 'fonts',
  }),
  textAlign: defineUtility({
    values: {
      left: 'left',
      center: 'center',
      right: 'right',
      justify: 'justify',
    },
  }),
  
  // Color utilities
  color: defineUtility({
    values: 'colors',
  }),
  backgroundColor: defineUtility({
    values: 'colors',
  }),
  
  // Border utilities
  borderWidth: defineUtility({
    values: 'borderWidths',
  }),
  borderRadius: defineUtility({
    values: 'radii',
  }),
  
  // Other common utilities
  gap: defineUtility({
    values: 'spacing',
  }),
  userSelect: defineUtility({
    values: {
      none: 'none',
      text: 'text',
      all: 'all',
      auto: 'auto',
    },
  }),
};

export const patterns = {
  flex: definePattern({
    transform(props) {
      const { align, justify, direction, wrap, gap, ...rest } = props;
      return {
        display: 'flex',
        alignItems: align,
        justifyContent: justify,
        flexDirection: direction,
        flexWrap: wrap,
        gap,
        ...rest,
      };
    },
  }),
  grid: definePattern({
    transform(props) {
      const { columns, rows, gap, ...rest } = props;
      return {
        display: 'grid',
        gridTemplateColumns: columns,
        gridTemplateRows: rows,
        gap,
        ...rest,
      };
    },
  }),
  wrap: definePattern({
    properties: {
      display: 'flex',
      flexWrap: 'wrap',
    },
  }),
  center: definePattern({
    transform(props) {
      return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...props,
      };
    },
  }),
};
