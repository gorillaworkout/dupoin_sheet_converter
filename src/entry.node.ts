// Template generation, do not manually modify
import { defineNode } from '@gen/node';

import { useApp } from './entry.node.apply';

export default defineNode({
    async devApp(esmx) {
        return import('@gen/rspack').then((m) => m.createApp(esmx));
    },
    useApp
});
