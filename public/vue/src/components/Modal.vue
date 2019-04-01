 <template>
    <transition name="modal">
        <div class="modal-mask">
            <div class="modal-wrapper">
                <div class="modal-content">
                    <div class="modal-header">
                        <slot name="header">

                        </slot>
                        <button class="modal-close" @click="$emit('close')">
                            <icon name="close"></icon>
                        </button>
                    </div>

                    <div class="modal-body">
                        <slot name="body">
                            default body
                        </slot>
                    </div>

                    <div class="modal-footer">
                        <slot name="footer">
                            <button class="pure-button pure-button-primary modal-button" @click="$emit('close')">
                                Okay
                            </button>
                        </slot>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import Icon from './Icon.vue';

export default {
    components: {
        Icon
    }
}
</script>


<style lang="scss">
.modal-mask {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 9998;
    background-color: rgba(0, 0, 0, .5);
    transition: opacity .3s ease;
}

.modal-wrapper {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;

    width: 500px;
    margin: 30px auto;

    background-color: #fff;
    border-radius: 4px;
    border-color: #cccccc;
    transition: all .3s ease;
    font-family: Helvetica, Arial, sans-serif;
}

.modal-content {
    display: flex;
    flex-direction: column;
}

.modal-header h3 {
    margin: 0;
}

.modal-body {
    flex: 1 1 auto;
    padding: 15px;
}

.modal-close {
    background: transparent;
    border: 0;
    padding: 0;
    color: #333;
}

.modal-close:hover {
    color: black;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding: 15px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid #eee;
    padding: 15px;
}

.modal-enter {
    opacity: 0;
}

.modal-leave-active {
    opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
    transform: scale(1.1);
}
</style>
