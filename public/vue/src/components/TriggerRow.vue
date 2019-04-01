<template>
    <tr>
        <td v-if="item.regex">
            <code>{{item.trigger}}</code>
            <small class="text-muted">(Regex)</small>
        </td>
        <td v-if="!item.regex">{{item.trigger}}</td>
        <td>
            <a :href="'/api/file/' + id" target="_blank">{{item.file}}</a>
        </td>
        <td class="text-center">{{item.volume}}%</td>
        <td class="text-center">{{item.length == 0 ? "all" : item.length + "s"}}</td>
        <td class="text-center">{{item.fade}}s</td>
        <td>
            <div class="pure-menu pure-menu-horizontal menu-actions">
                <ul class="pure-menu-list">    
                    <li class="pure-menu-item pure-menu-has-children pure-menu-allow-hover">
                        <a href="#" class="pure-menu-link">Actions</a>
                        <ul class="pure-menu-children">
                            <li class="pure-menu-item" @click="$emit('play')"><a href="#" class="pure-menu-link"><icon name="play"></icon> Play</a></li>
                            <li class="pure-menu-item"><a href="#" class="pure-menu-link"><icon name="pencil-square-o"></icon> Edit</a></li>
                            <li class="pure-menu-item" @click="$emit('delete')"><a href="#" class="pure-menu-link"><icon name="times"></icon> Delete</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </td>
    </tr>
</template>

<script>
import Icon from './Icon.vue';

export default {
    name: 'trigger-row',
    props: ['item', 'id'],
    components: {
        Icon
    }
}
</script>

<style lang="scss">
.button {
    opacity: 0.5;
    cursor: pointer;
}

.button:hover {
    opacity: 1;
}
</style>