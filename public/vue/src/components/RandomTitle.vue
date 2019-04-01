<script>
export default {
    name: 'random-title',
    data() {
        return {
            random: Math.random()
        };
    },
    render(createElement) {
        let slots = this.$slots.default.filter($slot => $slot.tag == "p");
        return (<p>
            {[slots[Math.floor(this.random * slots.length)]]}
        </p>);
    }
}
</script>